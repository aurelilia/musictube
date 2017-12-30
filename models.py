from django.db import models
from django.contrib.auth.models import User

class Video(models.Model):
    """ A YouTube video. URL is a 'youtube.com/?watch=' URL. """
    title = models.CharField('Video title', max_length=2048)
    url = models.URLField('Video URL', max_length=255)

    def __str__(self):
        return self.title


class Playlist(models.Model):
    """ A playlist. Contains info about itself, its videos and owner. """
    pid = models.CharField('Playlist ID', max_length=15)
    name = models.CharField('Playlist name', max_length=2048)
    videos = models.ManyToManyField(Video)
    user = models.ForeignKey(User, null=True, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.name
