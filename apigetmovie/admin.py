from django.contrib import admin
from .models import Fav, UserFav

# Register your models here.

admin.site.register(Fav)
admin.site.register(UserFav)