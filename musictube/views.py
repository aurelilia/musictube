import json
import pafy
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from musictube.models import Playlist, Video
from musictube.settings import DEBUG


@login_required
def frontend(request):
    """ Returns the web frontend. """
    return render(request, 'index.html', context={ 'DEBUG': DEBUG })


@login_required
def api(request, action):
    """ For interacting with the server. Calls fitting function depending on request. """
    actions = {
        'getaudio': getAudio,
        'fetchplaylists' : fetchPlaylists,
        'addplaylist': addPlaylist,
        'addvideo': addVideo,
        'deleteplaylist': deletePlaylist,
        'deletevideo': deleteVideo,
        'importplaylist': importPlaylist,
        'renameplaylist': renamePlaylist
    }

    # Pass the function either body, POST or GET, depending on which is included, or an
    # empty dict if all are empty
    data = json.loads(request.body) if request.body     \
           else request.GET if request.GET              \
           else request.POST if request.POST            \
           else {}

    try:
        return HttpResponse(actions[action](request, data))
    except KeyError:
        return HttpResponseBadRequest('Missing argument')
    except (AssertionError, ValueError):
        return HttpResponseBadRequest('Illegal argument')

def getAudio(request, data):
    """ Takes video URL or id, returns audio URL. """
    video = pafy.new(data['url'])
    return video.getbestaudio().url

def fetchPlaylists(request, data):
    """ API for getting info, using JSON """
    playlists_query = Playlist.objects.filter(user=request.user)
    playlists = list(playlists_query.all().values())

    # QuerySets need to be turned into a dict before being seializable to JSON...
    # Django doesn't allow many-to-many relationships to be reassinged, resulting in... this.
    for plist_query, plist_dict in zip(playlists_query, playlists):
        plist_dict['videos'] = list(plist_query.videos.all().values())
    return json.dumps(playlists, cls=DjangoJSONEncoder)

def addPlaylist(request, data):
    if 'youtube.com' in data['name']:
        return importPlaylist(request, data)
    assert not Playlist.objects.filter(user=request.user, name=data['name'])
    playlist = Playlist(name=data['name'], user=request.user, private=False)
    playlist.save()
    return

def addVideo(request, data):
    pafy_vid = pafy.new(data['name'])
    video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
    video.save()
    playlist = get_object_or_404(Playlist, user=request.user, id=data['listid'])
    playlist.videos.add(video)
    playlist.save()
    return

def deletePlaylist(request, data):
    get_object_or_404(Playlist, user=request.user, id=data['listid']).delete()
    return

def deleteVideo(request, data):
    playlist = get_object_or_404(Playlist, user=request.user, id=data['listid'])
    video = get_object_or_404(Video, id=data['videoid'])
    playlist.videos.remove(video)
    playlist.save()
    return

def importPlaylist(request, data):
    plist_pafy = pafy.playlist.get_playlist(data['url'])
    playlist = Playlist(name=plist_pafy['title'], user=request.user, private=False)
    playlist.save()
    for pafy_item in plist_pafy['items']:
        pafy_vid = pafy_item['pafy']
        video = Video(title=pafy_vid.title, length=pafy_vid.length, url=pafy_vid.videoid)
        video.save()
        playlist.videos.add(video)
    playlist.save()
    return

def renamePlaylist(request, data):
    assert not Playlist.objects.filter(user=request.user, name=data['name'])
    playlist = get_object_or_404(Playlist, user=request.user, id=data['listid'])
    playlist.name = data['name']
    playlist.save()
    return
 