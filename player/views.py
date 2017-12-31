from django.shortcuts import render
from django.contrib.auth import views as auth_views
from musictube.models import Playlist


def home(request):
    """ Returns the main page. """
    if request.user.is_authenticated:
        return render(request, 'player/index.html',
                      context={'playlists': Playlist.objects.filter(user=request.user)})
    return auth_views.login(request)
