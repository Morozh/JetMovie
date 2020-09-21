from django.urls import path
from . import views


urlpatterns = [
    path("", views.index),
]

urlpatterns += [
    path("signup", views.signup),
    path("logout", views.logout_),
]
urlpatterns += [
    path("login", views.login_)
]
urlpatterns += [
    path("movie/<int:id>", views.index)
]
urlpatterns += [
    path("add-fav", views.add_fav)
]
urlpatterns += [
    path("get-favs", views.get_favs)
]
urlpatterns += [
    path("get-user", views.get_user)
]
urlpatterns += [
    path("remove-fav", views.remove_fav)
]
urlpatterns += [
    path('feedback', views.feedback),
]
