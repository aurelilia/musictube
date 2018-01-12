import json
import pafy
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_list_or_404, get_object_or_404
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
from musictube.player.views import fetch
from musictube.models import Playlist, Video


@login_required
def addPlaylist(request):
    content = json.loads(request.POST['content'])
    if not Playlist.objects.filter(user=request.user, name=content['name']):
        playlist = Playlist(name=content['name'], user=request.user, private=content['private'])
        playlist.save()
    return HttpResponse('')


@login_required
def addVideo(request):
    content = json.loads(request.POST['content'])
    pafy_vid = pafy.new(content['url'])
    video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
    video.save()
    playlist = get_object_or_404(Playlist, user=request.user, name=content['plistname'])
    playlist.videos.add(video)
    playlist.save()
    return HttpResponse(json.dumps(model_to_dict(video), cls=DjangoJSONEncoder))


@login_required
def deletePlaylist(request):
    get_object_or_404(Playlist, user=request.user, name=request.POST['content']).delete()
    return HttpResponse('')


@login_required
def deleteVideo(request):
    content = json.loads(request.POST['content'])
    playlist = get_object_or_404(Playlist, user=request.user, name=content[0])
    video = get_object_or_404(Video, title=content[1])
    playlist.videos.remove(video)
    playlist.save()
    return HttpResponse('')


@login_required
def importPlaylist(request):
    content = json.loads(request.POST['content'])
    plist_pafy = pafy.playlist.get_playlist(content['url'])
    playlist = Playlist(name=plist_pafy['title'], user=request.user, private=content['private'])
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
    content = json.loads(request.POST['content'])
    if not Playlist.objects.filter(user=request.user, name=content['new']):
        playlist = get_object_or_404(Playlist, user=request.user, name=content['old'])
        playlist.name = content['new']
        playlist.save()
    return HttpResponse('')
