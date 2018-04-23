import json
import pafy
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.forms.models import model_to_dict
from musictube.player.views import fetch
from musictube.models import Playlist, Video


@login_required
def addPlaylist(request):
    data = json.loads(request.body)
    if not Playlist.objects.filter(user=request.user, name=data['name']):
        playlist = Playlist(name=data['name'], user=request.user, private=False)
        playlist.save()
        return JsonResponse(model_to_dict(playlist))
    return HttpResponse('')


@login_required
def addVideo(request):
    data = json.loads(request.body)
    pafy_vid = pafy.new(data['url'])
    video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
    video.save()
    playlist = get_object_or_404(Playlist, user=request.user, name=data['plistname'])
    playlist.videos.add(video)
    playlist.save()
    return JsonResponse(model_to_dict(video))


@login_required
def deletePlaylist(request):
    data = json.loads(request.body)
    get_object_or_404(Playlist, user=request.user, name=data['name']).delete()
    return HttpResponse(request.body)


@login_required
def deleteVideo(request):
    data = json.loads(request.body)
    playlist = get_object_or_404(Playlist, user=request.user, name=data['playlist'])
    for video in Video.objects.filter(title=data['video']):
        playlist.videos.remove(video)
        playlist.save()
    return HttpResponse('')


@login_required
def importPlaylist(request):
    data = json.loads(request.body)
    plist_pafy = pafy.playlist.get_playlist(data['url'])
    playlist = Playlist(name=plist_pafy['title'], user=request.user)
    playlist.save()
    for pafy_item in plist_pafy['items']:
        pafy_vid = pafy_item['pafy']
        video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
        video.save()
        playlist.videos.add(video)
    playlist.save()
    return HttpResponse(fetch(request))


@login_required
def renamePlaylist(request):
    data = json.loads(request.body)
    if not Playlist.objects.filter(user=request.user, name=data['new']):
        playlist = get_object_or_404(Playlist, user=request.user, name=data['old'])
        playlist.name = data['new']
        playlist.save()
    return HttpResponse('')
