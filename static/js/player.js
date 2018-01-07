// Interact with server via GET request. 
// "whenReady" is a function executed on state change.
function sendGET(location, whenReady) {
    var form = new FormData();
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open("GET", location);
    request.send(form);
}


// Volume slider
function updateVolume(num) {
    if (num !== vm.volume) {
        vm.volume = num;
        // Store volume in local storage, so the user doesn't lose it on reload
        localStorage.setItem("volume", num);
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

// Scrolling title
var scroller = null;
function scrollTitle(text) {
    if (vm.scroll_title && (document.title != "MusicTube")) {
        document.title = text;
        scroller = setTimeout(function () {
            scrollTitle(text.substr(1) + text.substr(0, 1));
        }, 500);
    } else {
        clearTimeout(scroller);
        document.title = vm.cur_video === null ? "MusicTube" : vm.cur_video.title;
    }
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
    <span v-if="!playlists.length">No playlists. Go to "Edit Playlists" to add one!</span>
    <table width="90%" v-else>
        <tr v-for="playlist in playlists" :key="playlist.id"
            v-on:click="$emit('update:view', playlist)">
            <td class="name">{{ playlist.name }}</td>
            <td class="context">{{ playlist.videos.length }} {{ (playlist.videos.length === 1) ? "title":"titles" }}</td>
        </tr>
    </table>
    `,
});

Vue.component('playlist-videos', {
    props: ['playlists', 'cur_playlist_view'],
    template: `
    <span v-if="!cur_playlist_view.videos.length">No videos. Go to "Edit Playlists" to add one!</span>
    <table width="90%" v-else>
        <tr v-for="video in cur_playlist_view.videos" :key="video.id"
            v-on:click="$emit('update:track', [cur_playlist_view, video])">
            <td class="thumb"><img :src="'https://i.ytimg.com/vi/' + video.url + '/mqdefault.jpg'" height=60px></img></td>
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
        random: false,
        cur_screen: "playlists",
        menu_active: false,
        scroll_title: false,
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
            if (vm.cur_playlist.videos[index] === vm.cur_video) {
                return;
            }
            if (vm.random) {
                index = Math.floor((Math.random() * vm.cur_playlist.videos.length) + 1);
            }
            if (index >= 0 && index < vm.cur_playlist.videos.length) {
                vm.player.e.pause();
                vm.updateCurrentTrack(vm.cur_playlist.videos[index]);
            } else {
                vm.cur_video_index = 0;
            }
        },
        scroll_title: function (bool) {
            var text = vm.cur_video === null ? "MusicTube":vm.cur_video.title;
            scrollTitle(text);
            localStorage.setItem("scroll", bool);
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
                    //document.title = video.title + " | Musictube";
                    scrollTitle(video.title + "     ");
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
        },
        onRandom() {
            vm.random = !vm.random;
            document.getElementById("random-button").classList.toggle("grey");
            localStorage.setItem("random", vm.random);
        }
    }
});

// Check if volume is already in local storage; use default value if not
if (localStorage.getItem("volume") !== null) {
    updateVolume(localStorage.getItem("volume"));
} else {
    updateVolume(25);
}

// Get random state from local storage; toggle random if true
document.getElementById("random-button").classList.toggle("grey");
if (localStorage.getItem("random") === "true") {
    vm.onRandom();
}

// Get title scroll settings
if (localStorage.getItem("scroll") === "true") {
    vm.scroll_title = true;
}