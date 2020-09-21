from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User


class RegistrationUsersForm(forms.ModelForm):
    error_css_class = 'error'
    required_css_class = 'required'
    password = forms.CharField(min_length=3, widget=forms.widgets.PasswordInput())

    class Meta:
        model = User
        fields = ('email', 'username')


class LoginFormUser(forms.Form):
    error_css_class = 'error'
    required_css_class = 'required'
    username = forms.CharField()
    password = forms.CharField(widget=forms.widgets.PasswordInput())


