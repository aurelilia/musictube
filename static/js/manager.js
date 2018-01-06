// Interact with server via GET request. 
// "whenReady" is a function executed on state change.
function sendGET(location, whenReady) {
    var form = new FormData();
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open("GET", location);
    request.send(form);
}
// Interact via POST request.
function sendPOST(location, content, whenReady) {
    var form = new FormData();
    form.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
    form.append("content", content);
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open("POST", location);
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
};


/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById("json").innerHTML);

Vue.component('playlists', {
    props: ['playlists'],
    template: `
    <table width="90%">
        <tr v-for="playlist in playlists" :key="playlist.id"
            v-on:click="$emit('update:view', playlist)">
            <td class="name">{{ playlist.name }}</td>
            <td class="context">{{ playlist.videos.length }} titles</td>
            <td class="delete"><i class="fa fa-trash-o" v-on:click="onDelete(playlist)"></i></td>
        </tr>
    </table>
    `,
    methods: {
        onDelete(obj) {
            sendPOST("/e/dp/", obj.name);
            vm.playlists.pop(obj);
            vm.cur_screen = "playlists";
        }
    }
});

Vue.component('playlist-videos', {
    props: ['playlists', 'cur_playlist'],
    template: `
    <table width="90%">
        <tr v-for="video in cur_playlist.videos" :key="video.id">
            <td class="name">{{ video.title }}</td>
            <td class="context">{{ formatSeconds(video.length) }}</td>
            <td class="delete"><i class="fa fa-trash-o" v-on:click="onDelete(video)"></i></td>
        </tr>
    </table>
    `,
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onDelete(obj) {
            sendPOST("/e/dv/", JSON.stringify([vm.cur_playlist.name, obj.title]));
            vm.cur_playlist.videos.pop(obj);
        }
    }

});


var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        cur_screen: "playlists",
        cur_playlist: null,
    },
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onPlaylistClick(view) {
            this.cur_playlist = view;
            this.cur_screen = "playlist-videos";
        },
        onAdd() {
            switch (vm.cur_screen) {
                case "playlists":
                    new_playlist = {
                        name: prompt("Give it a name:"),
                        private: false,
                        videos: []
                    };
                    vm.playlists.push(new_playlist);
                    sendPOST("/e/np/", JSON.stringify(new_playlist));
                    break;
                case "playlist-videos":
                    new_video = {
                        url: prompt("Enter the URL:"),
                        plistname: vm.cur_playlist.name
                    };
                    sendPOST("/e/nv/", JSON.stringify(new_video), function () {
                        if (this.readyState == 4 && this.status == 200) {
                            new_video['title'] = this.responseText;
                        }
                    });
                    break;
            }
        },
        onDelete(obj) {
            switch (vm.cur_screen) {
                case "playlists":
                    sendPOST("/e/dp", obj.name);
                    vm.playlists.pop(obj);
                    break;
                case "playlist-videos":
                    sendPOST("/e/dv", JSON.stringify([cur_playlist.name, obj.title]));
                    vm.cur_playlist.videos.pop(obj);
                    break;
            }
        }
    }
});