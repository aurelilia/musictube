from django.urls import path, re_path
from . import views

app_name = 'player'
urlpatterns = [
    path('u/<url>', views.directURL, name='directURL'),
    re_path('^', views.home, name='home')
]
