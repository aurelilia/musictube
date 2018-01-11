# MusicTube
Create and listen to playlists from YouTube videos, without having to use YouTube's heavy player.
Streams YouTube videos as just audio, requiring less bandwidth.
Uses Django/Python for backend, VueJS for frontend.



## Installation
This depends on django >= 2.0 and pafy. To install both with pip, do:

`pip3 install django youtube-dl pafy`


#### Additionally, you'll have to create two files in django's BASE_DIR:

key: Put your SECRET_KEY in here. If this is missing, a dev env will be assumed and a default key be used.

database: Put your django DATABASE settings in here (serialized in JSON).  


#### Finally, compile the SASS files and put them under static/css.