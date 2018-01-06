import json
import random
import string
import pafy
from django.shortcuts import render
from django.contrib.auth import views as auth_views
from django.http import HttpResponse
from musictube.player.views import fetch
from musictube.models import Playlist, Video


def home(request):
    """ Returns the main page. """
    if request.user.is_authenticated:
        context = {'json': fetch(request)}
        return render(request, 'manager/index.html', context=context)
    return auth_views.login(request)


def addPlaylist(request):
    content = json.loads(request.POST['content'])
    # Second condition: check if user already has a playlist of that name.
    if request.user.is_authenticated and not Playlist.objects.filter(user=request.user, name=content['name']):
        playlist = Playlist(name=content['name'], user=request.user, private=content['private'])
        playlist.save()
        return HttpResponse("true")
    return HttpResponse("false")


def addVideo(request):
    if request.user.is_authenticated:
        content = json.loads(request.POST['content'])
        pafy_vid = pafy.new(content['url'])
        video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
        video.save()
        playlist = Playlist.objects.filter(user=request.user, name=content['plistname'])[0]
        playlist.videos.add(video)
        playlist.save()
        return HttpResponse("true")
    return HttpResponse("false")
