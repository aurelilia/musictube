from django.db import models
from django.contrib.auth.models import User

class Video(models.Model):
    """ A YouTube video. URL is a 'youtube.com/?watch=' URL. """
    title = models.CharField('Video title', max_length=2048)
    url = models.CharField('Video URL', max_length=255)
    length = models.IntegerField('Video length')

    def __str__(self):
        return self.title


class Playlist(models.Model):
    """ A playlist. Contains info about itself, its videos and owner. """
    name = models.CharField('Playlist name', max_length=2048)
    videos = models.ManyToManyField(Video)
    user = models.ForeignKey(User, null=True, on_delete=models.DO_NOTHING)
    private = models.BooleanField('Private playlist')

    def __str__(self):
        return self.name
