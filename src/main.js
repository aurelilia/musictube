import Vue from 'vue'
import playlists from './components/playlists.vue'
import videos from './components/videos.vue'


// Prevent document from being seen until it is fulled loaded
document.body.hidden = true;


// Close the dropdown menu if the user clicks outside of it
window.onclick = (event) => {
    if (!event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) {
        vm.menu_active = false;
    }
};

// Save user prefrences to localStorage on unload
window.onunload = () => {
    localStorage.setItem('scroll', vm.scroll_title);
    localStorage.setItem('volume', vm.volume);
    localStorage.setItem('random', vm.random);
};


/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById('json').innerHTML);

Vue.component('playlists', playlists);
Vue.component('videos', videos);

var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        random: false,
        cur_screen: 'playlists',
        menu_active: false,
        scroll_title: true,
        // setInterval ID
        scroller: null,
        // Current playlist + video are the ones being played, cur_playlist_view is the one being
        // looked at with the videos component
        cur_playlist: null,
        cur_playlist_view: null,
        cur_video: null,
        cur_video_index: 0,
        // EDITOR
        editor: false,
        add: false,
        // Player/audio element + related vars
        player: {
            e: document.getElementById('player'),
            title: 'No track playing.',
            position: 0
        },
        playing: false,
        volume: 25,
    },
    watch: {
        volume: (vol) => {
            // Setting volume in HTML tags is not possible, so v-bind isn't an option.
            vm.player.e.volume = vol / 400;
        },
        cur_video_index: (index) => {
            if (vm.cur_playlist.videos[index] === vm.cur_video) {
                return;
            }
            if (vm.random) {
                index = Math.floor((Math.random() * vm.cur_playlist.videos.length) + 1);
            }
            if (index >= 0 && index < vm.cur_playlist.videos.length) {
                vm.updateCurrentTrack(vm.cur_playlist.videos[index]);
            } else {
                vm.cur_video_index = 0;
            }
        },
        scroll_title: () => {
            var text = vm.cur_video === null ? 'MusicTube' : vm.cur_video.title;
            scrollTitle(text);
        }
    },
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        }, 
        scrollTitle(text) {
            clearTimeout(scroller);
            document.title = text;
            if (vm.scroll_title && text !== 'MusicTube') {
                scroller = setTimeout(() => {
                    vm.scrollTitle(text.substr(1) + text.substr(0, 1));
                }, 500);
            }
        },
        // Interact via XMLHTTP request.
        // 'whenReady' is a function executed on state change.
        sendRequest(type, location, content, whenReady) {
            var form = new FormData();
            form.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
            if (type === 'POST') form.append('content', content);
            var request = new XMLHttpRequest();
            request.onreadystatechange = whenReady;
            request.open(type, location);
            request.send(form);
        },
        // YouTube maxresdefault thumbnails sometimes aren't available, so we fallback to mqdefault.
        updateThumbnail(video) {
            var image = new Image();
            image.onload = function () {
                if (('naturalHeight' in image && image.naturalHeight <= 90) || image.height <= 90) {
                    video.thumbnail = 'https://i.ytimg.com/vi/' + video.url + '/mqdefault.jpg';
                } else {
                    video.thumbnail = 'https://i.ytimg.com/vi/' + video.url + '/maxresdefault.jpg';
                }
            }
            image.onerror = function () { };
            image.src = 'https://i.ytimg.com/vi/' + video.url + '/maxresdefault.jpg';
        },
        onPlaylistClick(view) {
            this.cur_playlist_view = view;
            this.cur_screen = 'videos';
        },
        updateCurrentTrack(video) {
            vm.player.e.pause();
            vm.player.e.currentTime = 0;
            vm.cur_video = video;
            vm.cur_video_index = vm.cur_playlist.videos.indexOf(vm.cur_video);
            vm.scrollTitle(video.title);
            vm.player.title = 'Loading...';
            vm.updateThumbnail(video);
            vm.sendRequest('GET', '/u/' + video.url, null, function () {
                if (this.readyState == 4 && this.status == 200) {
                    vm.player.title = video.title;
                    vm.player.e.setAttribute('src', this.responseText);
                    vm.player.e.play();
                    vm.playing = true;
                }
            });
        },
        updateCurrentPlaylistAndTrack(info) {
            if (!vm.editor) {
                vm.cur_playlist = info[0];
                vm.updateCurrentTrack(info[1]);
            }
        },
        onPlayPause() {
            if (!vm.playing && vm.player.e.src !== '') {
                vm.player.e.play();
            } else if (vm.playing) {
                vm.player.e.pause();
            }
            vm.playing = !vm.player.e.paused;
        },
        onPrevTrack() {
            if (vm.playing) {
                vm.cur_video_index -= 1;
            }
        },
        onNextTrack() {
            if (vm.playing) {
                vm.cur_video_index += 1;
            }
        },
        // EDITOR
        onAdd() {
            var input = document.getElementById('add-input').value;
            switch (vm.cur_screen) {
            case 'playlists':
                if (input.includes('youtube.com/playlist')) {
                    var content = {
                        url: input,
                        private: false
                    };
                    vm.sendRequest('POST', '/e/ip/', JSON.stringify(content), function() {
                        if (this.readyState == 4 && this.status == 200) {
                            vm.playlists = JSON.parse(this.responseText);
                        }
                    });
                } else {
                    for (var i = 0, len = vm.playlists.length; i < len; i++) {
                        if (input === vm.playlists[i].input) {
                            alert('You already have a playlist with that input! Please choose another one.');
                            return;
                        }
                    }
                    var new_playlist = {
                        name: input,
                        private: false,
                        videos: []
                    };
                    vm.playlists.push(new_playlist);
                    vm.sendRequest('POST', '/e/np/', JSON.stringify(new_playlist));
                }
                break;
            case 'videos':
                if (!input.includes('youtube.com/watch?v=')) {
                    alert('Not a valid URL! Please try again.');
                    return;
                }
                var new_video = {
                    url: input,
                    plistname: vm.cur_playlist_view.name
                };
                vm.sendRequest('POST', '/e/nv/', JSON.stringify(new_video), function() {
                    if (this.readyState == 4 && this.status == 200) {
                        vm.cur_playlist_view.videos.push(JSON.parse(this.responseText));
                    }
                });
                break;
            }
            vm.add = false;
            document.getElementById('add-input').value = '';
        },
    }
});


// Pause the player; add some event handlers to it
vm.player.e.pause();
vm.player.e.addEventListener('timeupdate', () => {
    vm.player.position = Math.floor(vm.player.e.currentTime);
});
vm.player.e.addEventListener('ended', vm.onNextTrack);


// Check if preferences are already in local storage; use default value if not
if (localStorage.getItem('volume') != null) {
    vm.volume = localStorage.getItem('volume');
    vm.random = localStorage.getItem('random') === 'true';
    vm.scroll_title = localStorage.getItem('scroll') === 'true';
}

// Wait for SASS theme to load, then unhide the page hidden at line 7 of this file
var theme = localStorage.getItem('theme') != undefined ? localStorage.getItem('theme') : 'transparent';
import('./sass/theme_' + theme + '.sass').then(() => {
    document.body.hidden = false;
});
