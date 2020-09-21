from django.db import models
from django.contrib.auth.models import User


class Fav(models.Model):
    favid = models.IntegerField()
    type = models.CharField(max_length=5, blank=True)

    def __str__(self):
        return str(self.favid) + str(self.type)

    def get_type(self):
        return str(self.type)


class UserFav(models.Model):
    """
    Model of favorite film users
    """
    userid = models.IntegerField()
    favid = models.IntegerField()

    def __str__(self):
        return str(self.userid) + str(self.favid)

    def get_favid(self):
        return str(self.favid)

