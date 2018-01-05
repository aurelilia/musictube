from django.shortcuts import render
from django.contrib.auth import views as auth_views
from musictube.player.views import fetch


def home(request):
    """ Returns the main page. """
    if request.user.is_authenticated:
        context = {'json': fetch(request)}
        return render(request, 'manager/index.html', context=context)
    return auth_views.login(request)
