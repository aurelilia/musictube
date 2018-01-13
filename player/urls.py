from django.urls import path

from . import views

app_name = 'player'
urlpatterns = [
    path('', views.home, name='home'),
    path('f/', views.fetch, name='fetch'),
    path('u/<url>', views.directURL, name='directURL')
]
