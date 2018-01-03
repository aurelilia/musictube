from django.urls import path

from . import views

app_name = "player"
urlpatterns = [
    path('', views.home, name='home'),
    path('p/<playlist_id>', views.fetchPlaylist, name='fetchPlaylist'),
]