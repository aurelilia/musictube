import json
import pafy
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.core.serializers.json import DjangoJSONEncoder
from musictube.models import Playlist
from musictube.settings import DEBUG

@login_required
def home(request):
    """ Returns the main page. """
    context = {'json': fetch(request), 'DEBUG': DEBUG}
    return render(request, 'index.html', context=context)


@login_required
def fetch(request):
    """ API for getting info, using JSON """
    playlists_query = Playlist.objects.filter(user=request.user)
    playlists = list(playlists_query.all().values())

    # QuerySets need to be turned into a dict before being seializable to JSON...
    # Django doesn't allow many-to-many relationships to be reassinged, resulting in... this.
    for plist_query, plist_dict in zip(playlists_query, playlists):
        plist_dict['videos'] = list(plist_query.videos.all().values())
    return json.dumps(playlists, cls=DjangoJSONEncoder)


@login_required
def directURL(request, url):
    """ Takes youtube URL or id, returns audio URL from googlevideo. """
    video = pafy.new(url)
    return JsonResponse({ 'url': video.getbestaudio().url })
