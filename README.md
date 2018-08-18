# MusicTube

Create and listen to playlists from YouTube videos, without having to use YouTube's heavy player.
Streams YouTube videos as just audio, requiring less bandwidth.
Uses Django/Python for backend, VueJS for frontend.

## Installation

### Django Setup

This depends on django 2.1, pafy and django-webpack-loader. To install both with pip, do:

`pip3 install django youtube-dl pafy django-webpack-loader`

Additionally, you'll have to create two files in django's BASE_DIR:
key: Put your SECRET_KEY in here. If this is missing, a dev env will be assumed and a default key be used.
database: Put your django DATABASE settings in here (serialized in JSON).

### Webpack/Frontend Setup

``` bash
# install dependencies
npm install

# build for production
npm run build

# Manually compile SASS for login page
mkdir ./musictube/static/css
touch ./musictube/static/css/login.css
sass ./musictube/static/sass/login.sass > ./musictube/static/css/login.css
```
