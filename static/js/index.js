// Interact with server. 
// "type" can be either POST or GET
// "whenReady" is a function executed on state change.
function sendXMLHttp(name, data, location, type, whenReady) {
    var form = new FormData();
    if (name !== null) {
        form.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
        form.append(name, data);
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open(type, location);
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


// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById("json").innerHTML);
// Add playing element to the DOM, create an object for it
var player = {
    e: document.createElement("AUDIO"),
    title: "No track playing."
};
player.e.setAttribute("autoplay", "");
document.body.appendChild(player.e);
player.e.pause();


Vue.component('playlists', {
    props: ['playlists', 'current_playlist_index'],
    template: `
        <table width="90%">
            <tr v-for="playlist in playlists" :key="playlist.id"
                v-on:click="$emit('update:index', playlists.indexOf(playlist))">
                <td class="name">{{ playlist.name }}</td>
                <td class="context">{{ playlist.videos.length }} titles</td>
            </tr>
        </table>
    `,
});

Vue.component('playlist-videos', {
    props: ['playlists', 'current_playlist_index'],
    template: `
        <table width="90%">
            <tr v-for="video in playlists[current_playlist_index].videos" :key="video.id"
                v-on:click="$emit('update:track', video)">
                <td class="name">{{ video.title }}</td>
                <td class="context">{{ video.length }}s</td>
            </tr>
        </table>
    `
});

var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        player: player,
        playing: !player.e.paused,
        current_screen: "playlists",
        current_playlist_index: 0,
        current_video_index: 0
    },

    methods: {
        onPlaylistClick(index) {
            this.current_playlist_index = index;
            this.current_screen = "playlist-videos";
        },
        updateCurrentTrack(video) {
            sendXMLHttp(null, null, "/u/" + video.url, "GET", function () {
                if (this.readyState == 4 && this.status == 200) {
                    vm.player.title = video.title;
                    vm.current_video_index = vm.playlists[vm.current_playlist_index].videos.indexOf(video);
                    vm.player.e.setAttribute("src", this.responseText);
                    vm.player.e.play();
                    vm.playing = !vm.player.e.paused;
                }
            });
        },
        onPlayPause(video) {
            if (vm.player.e.paused && vm.player.e.src != "") {
                vm.player.e.play();
            } else if (!vm.player.e.paused) {
                vm.player.e.pause();
            }
            vm.playing = !vm.player.e.paused;
        },
        onPrevTrack() {
            player.e.pause();
            vm.current_video_index -= 1;
            vm.updateCurrentTrack(vm.playlists[vm.current_playlist_index].videos[vm.current_video_index])
        },
        onNextTrack() {
            player.e.pause();
            vm.current_video_index += 1;
            vm.updateCurrentTrack(vm.playlists[vm.current_playlist_index].videos[vm.current_video_index])

        }
    }
});