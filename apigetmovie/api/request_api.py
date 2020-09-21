from urllib.request import urlopen
from urllib.parse import urlencode
from random import randint
import json


class RandomFilm:
    def __init__(self, type_, **kwargs):
        self.api_key = "7e00b848ffbb0a2bb957f6631e1ad255"
        self.url_api_discover = "http://api.themoviedb.org/3/discover/" + type_ + "?%s"
        self.url_api_detail = "http://api.themoviedb.org/3/" + type_ + "/%s?%s"
        self.url_api_video = "http://api.themoviedb.org/3/" + type_ + "/%s/videos?%s"
        self.url_api_credits = "http://api.themoviedb.org/3/" + type_ + "/%s/credits?%s"
        self.max_page = 500
        self.type = type_
        self.vars_req_only_api = {"api_key": self.api_key, }
        self.vars_req_default = {"api_key": self.api_key, 'language': 'ru'}
        self.vars_req = {"api_key": self.api_key, 'language': 'ru'}
        self.vars_req.update(kwargs)

    def __error_or_return_dict(self, res):
        if res is False:
            return False

        res = json.loads(res)
        try:
            if res['errors'] is True:
                return False
        except KeyError:
            pass

        return res

    def get_film(self):
        res = False

        while res == False:
            res = self.__get_film()

        return res

    def __get_film(self):
        self.vars_req['page'] = randint(1, self.max_page)

        url = self.url_api_discover % urlencode(self.vars_req)  # добавляем критерии поиска в url
        res = urlopen(url).read().decode(encoding="UTF-8")  # читаем

        self.vars_req.pop('page')

        res = self.__error_or_return_dict(res)

        id = self.get_film_id(res['results'])

        res = self.get_film_for_id(id)
        credits_list = self.get_credits(id)
        try:
            res.update({"credits": credits_list, })
        except AttributeError:
            return False

        return res

    def get_film_for_id(self, id):
        detail = self.get_addinf(str(id), self.url_api_detail)

        if detail['overview'] == '' or detail['poster_path'] == '':
            return False

        video_trailer = self.get_addinf(str(id), self.url_api_video)
        detail.update({"video_trailer": video_trailer})
        credits_list = self.get_credits(id)
        try:
            detail.update({"credits": credits_list, })
        except AttributeError:
            return False
        result = detail
        print(detail)

        return result

    def get_credits(self, id):
        url = self.url_api_credits % (id, str(urlencode(self.vars_req_only_api)))
        res = urlopen(url).read().decode(encoding="UTF-8")
        print("\n\n\n\n\n\n")
        print(res)
        res = self.__error_or_return_dict(res)

        return res

    def get_addinf(self, id, url_api):
        # Функция получает айди и юрл, возвращает дополнитуельную информацию
        url = url_api % (id, str(urlencode(self.vars_req_default)))
        print(url)
        print(url)
        res = urlopen(url).read().decode(encoding="UTF-8")
        res = self.__error_or_return_dict(res)

        return res

    def get_film_id(self, res):
        max_len = len(res)
        num = randint(0, max_len - 1)
        film = res[num]
        movie_descriptions = film

        return movie_descriptions['id']
