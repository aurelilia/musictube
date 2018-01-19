// Interact with server via GET request. 
// 'whenReady' is a function executed on state change.
function sendGET(location, whenReady) {
    var form = new FormData();
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open('GET', location);
    request.send(form);
}
// Interact via POST request.
function sendPOST(location, content, whenReady) {
    var form = new FormData();
    form.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
    form.append('content', content);
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open('POST', location);
    request.send(form);
}


// Scrolling title
var scroller = null;
function scrollTitle(text) {
    clearTimeout(scroller);
    document.title = text;
    if (vm.scroll_title && text !== 'MusicTube') {
        scroller = setTimeout(function () {
            scrollTitle(text.substr(1) + text.substr(0, 1));
        }, 500);
    }
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) {
        vm.menu_active = false;
    }
};

// Save user prefrences to localStorage on unload
window.onunload = function () {
    localStorage.setItem('scroll', vm.scroll_title);
    localStorage.setItem('volume', vm.volume);
    localStorage.setItem('random', vm.random);
};


/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById('json').innerHTML);

Vue.component('playlists', {
    props: ['playlists', 'editor'],
    template: `
    <span v-if="!playlists.length">No playlists. Go into editor mode to add one!</span>
    <table v-else>
        <tr v-for="playlist in playlists" :key="playlist.id">
            <td class="playlist-thumb" v-if="playlist.videos !== null">
                <img :src="'https://i.ytimg.com/vi/' + video.url + '/mqdefault.jpg'" height="50px" v-for="(video, index) in playlist.videos.slice(0, 3)" :class="'thumb-' + (index + 1)"></img>
            </td>
            <td class="playlist-thumb" v-else></td>
            <td class="name" @click="$emit('update:view', playlist)">{{ playlist.name }}</td>
            <td class="context" @click="$emit('update:view', playlist)">{{ playlist.videos.length }} {{ (playlist.videos.length === 1) ? "title":"titles" }}</td>
            <td class="rename" v-if="editor"><i class="fa fa-edit" @click="onRename(playlist)"></i></td>
            <td class="delete" v-if="editor"><i class="fa fa-trash-o" @click="onDelete(playlist)"></i></td>
        </tr>
    </table>
    `,
    methods: {
        onDelete(obj) {
            if (confirm('Are you sure you want to delete the playlist?')) {
                sendPOST('/e/dp/', obj.name);
                vm.playlists.splice(vm.playlists.indexOf(obj), 1);
            }
        },
        onRename(obj) {
            var list_name = prompt('Enter a new name for the playlist:');
            if (list_name !== null && list_name !== '') {
                sendPOST('/e/rp/', JSON.stringify({
                    'old': obj.name,
                    'new': list_name
                }));
                obj.name = list_name;
            }
        }
    }
});

Vue.component('playlist-videos', {
    props: ['playlists', 'cur_playlist_view', 'editor'],
    template: `
    <span v-if="!cur_playlist_view.videos.length">No videos. Go into editor mode to add one!</span>
    <table v-else>
        <tr v-for="video in cur_playlist_view.videos" :key="video.id"
            @click="$emit('update:track', [cur_playlist_view, video])">
            <td class="thumb"><img :src="'https://i.ytimg.com/vi/' + video.url + '/mqdefault.jpg'" height=60px></img></td>
            <td class="name">{{ video.title }}</td>
            <td class="context">{{ formatSeconds(video.length) }}</td>
            <td class="delete" v-if="editor"><i class="fa fa-trash-o" @click="onDelete(video)"></i></td>
        </tr>
    </table>
    `,
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onDelete(obj) {
            if (confirm('Are you sure you want to remove the video?')) {
                sendPOST('/e/dv/', JSON.stringify([vm.cur_playlist_view.name, obj.title]));
                vm.cur_playlist_view.videos.splice(vm.cur_playlist_view.videos.indexOf(obj), 1);
            }
        }
    }
});


var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        random: false,
        cur_screen: 'playlists',
        menu_active: false,
        scroll_title: true,
        // Current playlist + video are the ones being played, cur_playlist_view is the one being
        // looked at with the playlist-videos component
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
        volume: function (vol) {
            // Setting volume in HTML tags is not possible, so v-bind isn't an option.
            vm.player.e.volume = vol / 400;
        },
        cur_video_index: function (index) {
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
        scroll_title: function () {
            var text = vm.cur_video === null ? 'MusicTube' : vm.cur_video.title;
            scrollTitle(text);
        }
    },
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onPlaylistClick(view) {
            this.cur_playlist_view = view;
            this.cur_screen = 'playlist-videos';
        },
        updateCurrentTrack(video) {
            vm.player.e.pause();
            vm.player.e.currentTime = 0;
            vm.cur_video = video;
            vm.cur_video_index = vm.cur_playlist.videos.indexOf(vm.cur_video);
            scrollTitle(video.title + ' <> ');
            vm.player.title = 'Loading...';
            sendGET('/u/' + video.url, function () {
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
                    sendPOST('/e/ip/', JSON.stringify(content), function () {
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
                    sendPOST('/e/np/', JSON.stringify(new_playlist));
                }
                break;
            case 'playlist-videos':
                if (!input.includes('youtube.com/watch?v=')) {
                    alert('Not a valid URL! Please try again.');
                    return;
                }
                var new_video = {
                    url: input,
                    plistname: vm.cur_playlist_view.name
                };
                sendPOST('/e/nv/', JSON.stringify(new_video), function () {
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
vm.player.e.addEventListener('timeupdate', function () {
    vm.player.position = Math.floor(vm.player.e.currentTime);
});
vm.player.e.addEventListener('ended', vm.onNextTrack);


// Check if preferences are already in local storage; use default value if not
if (localStorage.getItem('volume') !== null) {
    vm.volume = localStorage.getItem('volume');
    vm.random = localStorage.getItem('random') === 'true';
    vm.scroll_title = localStorage.getItem('scroll') === 'true';
}