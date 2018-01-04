import pafy
import json
from django.shortcuts import render
from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponse
from django.contrib.auth import views as auth_views
from django.core.serializers.json import DjangoJSONEncoder
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


def fetch(request):
    """ API for getting info, using JSON """
    playlists = Playlist.objects.filter(user=request.user)
    for playlist in playlists:
        # Videos need to be turned into a dict before being seializable to JSON...
        playlist.videos = playlist.videos.all().values()
    
    return HttpResponse(json.dumps(playlists), cls=DjangoJSONEncoder)

def directURL(request, url):
    """ Takes youtube URL, returns audio URL from googlevideo. """
    video = pafy.new(url)
    return HttpResponse(video.getbestaudio().url)