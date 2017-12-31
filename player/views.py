from django.shortcuts import render
from django.contrib.auth import views as auth_views
from musictube.models import Playlist


def home(request):
    """ Returns the main page. """
    if request.user.is_authenticated:
        playlists = Playlist.objects.filter(user=request.user)
        context = {'playlists': playlists}
        for playlist in playlists:
            playlist.count = len(playlist.videos.all())
        return render(request, 'player/index.html',
                      context=context)
    return auth_views.login(request)
