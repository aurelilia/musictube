import pafy
from django.shortcuts import render
from django.http import HttpResponseBadRequest, HttpResponseForbidden
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


def fetchPlaylist(request, playlist_id):
    """ Renders and returns a playlist """
    playlist = Playlist.objects.filter(pid=playlist_id)[0]
    if not playlist.private or playlist.user == request.user:
        context = {'videos': playlist.videos.all()}
        for video_model in context['videos']:
            video = pafy.new(video_model.url)
            video_model.direct_url = video.getbestaudio().url
        return render(request, 'player/playlist.html', context=context)
    return HttpResponseForbidden
