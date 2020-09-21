from django.shortcuts import render
from django.template.response import HttpResponse
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from apigetmovie.api.request_api import RandomFilm
from django.http import QueryDict
from json import dumps
from .models import Fav, UserFav
from urllib.parse import parse_qs
from discord_webhook import DiscordWebhook, DiscordEmbed
from django.core.mail import send_mail

def index(request, id=-1):
    if request.method == 'POST':
        response_ajax = request.read().decode("UTF-8")
        type_request = QueryDict(response_ajax).get('random')
        type_ = QueryDict(response_ajax).get('type')
        film = RandomFilm(type_)

        if type_request == 'false':
            res = film.get_film_for_id(id)

        else:
            res = film.get_film()

        if res is False:
            return HttpResponse(dumps({'error_api': 'Извините, но произошла неизвестная ошибка. Попробуйте еще раз'}))

        # проверяем есть ли фильм в избранном
        if request.user.is_authenticated:
            if type_request != "false":
                id = res['id']

            userid = User.objects.get(username=request.user.username).id
            if UserFav.objects.filter(userid=userid, favid=id).count() == 0:
                res.update({"is_favorite": False})
            else:
                res.update({"is_favorite": True})

        res.update({"error_api": ""})

        return HttpResponse(dumps(res))

    return render(request, 'index.html')


def signup(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/')

    if request.method == 'POST':
        errors = []
        response_ajax = parse_qs(request.read().decode("UTF-8"))
        username = response_ajax['username'][0]
        email = response_ajax['email'][0]
        password = response_ajax['password'][0]
        password_repeat = response_ajax['password-repeat'][0]

        exist_email = User.objects.filter(email=email).count()
        if exist_email > 0:
            errors.append({'input': 'email','text': 'Данный email уже используется'})

        exist_username = User.objects.filter(username=username).count()

        if exist_username > 0:
            errors.append({'input': 'username','text': 'Пользователь с таким именем уже существует'})

        if password != password_repeat:
            errors.append({'input': 'password','text': 'Пароли не совпадают'})

        if errors != []:
            res = dumps({'signup': False, 'errors': errors})
            return HttpResponse(res)

        user = User.objects.create_user(username, email, password)
        user.save()

        user = authenticate(request, username=username, password=password)
        login(request, user)
        result = get_list_favorite(username)
        result.update({'login': True, 'signup': True})

        webhook = DiscordWebhook(url='https://discordapp.com/api/webhooks/726552664934187049/Ywj3iwcGtVPvNnuuCzfJY9xW0IhGt7y_oKUXXkWClR5bwShifYjjQrKXuUSA9z23cBRf')
        embed = DiscordEmbed(title='+1 Пользователь - ' + username, description='Email: ' + email, color=242424)
        # add embed object to webhook
        webhook.add_embed(embed)

        webhook_response = webhook.execute()

        return HttpResponse(dumps(result))

    return HttpResponseRedirect('/')


def logout_(request):
    logout(request)
    return HttpResponseRedirect('/')


def login_(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/')

    if request.method == 'POST':
        response_ajax = parse_qs(request.read().decode("UTF-8"))
        username = response_ajax['username'][0]
        password = response_ajax['password'][0]

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            result = get_list_favorite(username)
            result.update({'login': True})
            return HttpResponse(dumps(result))
        else:
            return HttpResponse(dumps({'login': False}))

    return HttpResponseRedirect('/')


def get_user(request):
    if request.user.is_authenticated:
        username = request.user.username
        result = get_list_favorite(username)
        result.update({'username': username, })
        return HttpResponse(dumps(result))

    return HttpResponse(dumps({'username': False}))


def add_fav(request):

    if not request.user.is_authenticated:
        return HttpResponse(dumps({'fav_add': False, "authenticated": False}))

    if request.method == "POST":
        response_ajax = request.read().decode("UTF-8")
        id = QueryDict(response_ajax).get('filmId')
        type_ = QueryDict(response_ajax).get('type')
        userid = User.objects.get(username=request.user.username).id

        favid_or_not = Fav.objects.filter(favid=id).count()

        if favid_or_not == 0:
            Fav.objects.create(favid=id, type=type_)

        obj_ = UserFav.objects.filter(favid=id, userid=userid).count()

        if obj_ == 0:
            UserFav.objects.create(userid=userid, favid=id)
            result = get_list_favorite(request.user.username)
            result.update({'fav_add': True, "authenticated": True})

            return HttpResponse(dumps(result))
        return HttpResponse(dumps({'fav_add': False, "authenticated": True}))

    return HttpResponseRedirect('/')


def remove_fav(request):
    if request.method == "POST":

        if not request.user.is_authenticated:
            return HttpResponse(dumps({'fav_remove': False, "authenticated": False}))

        response_ajax = request.read().decode("UTF-8")
        id = QueryDict(response_ajax).get('filmId')
        userid = User.objects.get(username=request.user.username).id
        id_favorite_of_user = UserFav.objects.filter(favid=id, userid=userid)
        exist_id_favorite_of_user = id_favorite_of_user.count()

        if exist_id_favorite_of_user == 0:
            HttpResponse(dumps({"error": "film not added to favorites list"}))

        if id_favorite_of_user.delete():
            result = get_list_favorite(request.user.username)
            result.update({'error': False, })
            return HttpResponse(dumps(result))

    return HttpResponseRedirect('/')


def get_favs(request):

    if not request.user.is_authenticated:
        return HttpResponse(dumps({"authenticated": False}))

    if request.method == "POST":
        result = get_list_favorite(request.user.username)
        HttpResponse(dumps(result))

    return HttpResponseRedirect('/')


def get_list_favorite(username):
    userid = User.objects.get(username=username).id
    list_id = UserFav.objects.filter(userid=userid)
    result = []
    i = 1

    for id in list_id.all():
        type_ = Fav.objects.get(favid=id.get_favid()).get_type()
        film = RandomFilm(type_).get_film_for_id(id.get_favid())

        res = {"id": id.get_favid(), "type": type_, "poster_path": film["poster_path"], "title": film["title"], 'backdrop_path': film['backdrop_path'], 'genres': film['genres']}
        result.append(res)
        i +=1
    result = {"favorites": result, "username": username}
    return result


def feedback(request):
    if request.method == 'POST':
        response_ajax = request.read().decode("UTF-8")
        text = QueryDict(response_ajax).get('text')
        name = QueryDict(response_ajax).get('name')
        send_mail(name, text, 'mittle.group@mittle.jetmovie.ru', ['mittle.studio@gmail.com'], fail_silently=False)
        webhook = DiscordWebhook(url='https://discordapp.com/api/webhooks/726552664934187049/Ywj3iwcGtVPvNnuuCzfJY9xW0IhGt7y_oKUXXkWClR5bwShifYjjQrKXuUSA9z23cBRf')

        embed = DiscordEmbed(title='Новое сообщение от ' + name, description='Текст: ' + text, color=242424)

        webhook.add_embed(embed)

        webhook_response = webhook.execute()
        return HttpResponse(dumps({'send': True,}))
    return HttpResponseRedirect('/')
