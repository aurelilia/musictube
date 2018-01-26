from django.urls import path
from . import views

app_name = 'player'
urlpatterns = [
    path('', views.home, name='home'),
    path('u/<url>', views.directURL, name='directURL')
]
