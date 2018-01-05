// Interact with server via GET request. 
// "whenReady" is a function executed on state change.
function sendGET(location, whenReady) {
    var form = new FormData();
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open("GET", location);
    request.send(form);
}

// Navbar menu functionality
function toggleMenu() {
    document.getElementById("menu-dropdown").classList.toggle("show");
}
window.onclick = function (e) {
    if (!e.target.matches(".menu-button")) {
        document.getElementById("menu-dropdown").classList.remove('show');
    }
}

// Volume slider
function updateVolume(num) {
    if (num !== vm.volume) {
        vm.volume = num;
    }
}

// Position slider
function updatePosition(pos) {
    pos = Math.floor(pos);
    if (pos !== vm.player.position) {
        vm.player.position = pos;
        vm.player.e.currentTime = pos; 
    }
}

// Formats an int representing seconds into a MM:SS string
function formatSeconds(secs) {
    return secs / 60 + ":" + secs % 60;
}

/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById("json").innerHTML);
// Add player object
var player = {
    e: document.getElementById("player"),
    title: "No track playing.",
    position: 0
};
player.e.pause();
player.e.addEventListener('timeupdate', function () {
    vm.player.position = Math.floor(player.e.currentTime);
});
player.e.addEventListener('ended', function () {
    updatePosition(0);
    vm.onNextTrack();
});


Vue.component('playlists', {
    props: ['playlists'],
    template: `
    <table width="90%">
        <tr v-for="playlist in playlists" :key="playlist.id"
            v-on:click="$emit('update:view', playlist)">
            <td class="name">{{ playlist.name }}</td>
            <td class="context">{{ playlist.videos.length }} titles</td>
        </tr>
    </table>
    `,
});

Vue.component('playlist-videos', {
    props: ['playlists', 'cur_playlist_view'],
    template: `
    <table width="90%">
        <tr v-for="video in cur_playlist_view.videos" :key="video.id"
            v-on:click="$emit('update:track', [cur_playlist_view, video])">
            <td class="name">{{ video.title }}</td>
            <td class="context">{{ formatSeconds(video.length) }}</td>
        </tr>
    </table>
    `,
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
    }
});


var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        player: player,
        playing: !player.e.paused,
        volume: 400,
        cur_screen: "playlists",
        // Current playlist + video are the ones being played, cur_playlist_view is the one being
        // looked at with the playlist-videos component
        cur_playlist: null,
        cur_playlist_view: null,
        cur_video: null,
        cur_video_index: 0
    },
    watch: {
        volume: function (vol) {
            vm.player.e.volume = vol / 400;
        },
        cur_video_index: function (index, oldindex) {
            if (index >= 0 && index < vm.cur_playlist.videos.length) {

                if (!(vm.cur_playlist.videos[index] === vm.cur_video)) {
                    vm.player.e.pause();
                    vm.updateCurrentTrack(vm.cur_playlist.videos[index]);
                }
            } else {
                vm.cur_video_index = 0;
            }
        }
    },
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onPlaylistClick(view) {
            this.cur_playlist_view = view;
            this.cur_screen = "playlist-videos";
        },
        updateCurrentTrack(video) {
            vm.cur_video = video;
            vm.cur_video_index = vm.cur_playlist.videos.indexOf(vm.cur_video);
            sendGET("/u/" + video.url, function () {
                if (this.readyState == 4 && this.status == 200) {
                    vm.player.title = video.title;
                    vm.player.e.setAttribute("src", this.responseText);
                    vm.player.e.play();
                    vm.playing = !vm.player.e.paused;
                }
            });
        },
        updateCurrentPlaylistAndTrack(info) {
            vm.cur_playlist = info[0];
            vm.updateCurrentTrack(info[1]);
        },
        onPlayPause() {
            if (!vm.playing && vm.player.e.src !== "") {
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
        }
    }
});

updateVolume(25);