from django.shortcuts import render


def home(request):
    """ Returns the main page. """
    return render(request, 'player/index.html')
