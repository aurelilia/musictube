from django.urls import path
from . import views

app_name = 'manager'
urlpatterns = [
    path('np/', views.addPlaylist, name='addPlaylist'),
    path('nv/', views.addVideo, name='addVideo'),
    path('dp/', views.deletePlaylist, name='deletePlaylist'),
    path('dv/', views.deleteVideo, name='deleteVideo'),
    path('ip/', views.importPlaylist, name='importPlaylist'),
    path('rp/', views.renamePlaylist, name='renamePlaylist'),
]
