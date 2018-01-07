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
window.onclick = function (e) {
    if (!e.target.matches(".fa-bars")) {
        vm.menu_active = false;
    }
};


/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById("json").innerHTML);

Vue.component('playlists', {
    props: ['playlists'],
    template: `
    <span v-if="!playlists.length">No playlists. Press <i class="fa fa-plus" v-on:click="add = !add"></i> to add one!</span>
    <table width="90%" v-else>
        <tr v-for="playlist in playlists" :key="playlist.id">
            <td class="name" v-on:click="$emit('update:view', playlist)">{{ playlist.name }}</td>
            <td class="context" v-on:click="$emit('update:view', playlist)">{{ playlist.videos.length }} {{ (playlist.videos.length === 1) ? "title":"titles" }}</td>
            <td class="delete"><i class="fa fa-trash-o" v-on:click="onDelete(playlist)"></i></td>
        </tr>
    </table>
    `,
    methods: {
        onDelete(obj) {
            if (confirm("Are you sure you want to delete the playlist?")) {
                sendPOST("/e/dp/", obj.name);
                vm.playlists.splice(vm.playlists.indexOf(obj), 1);
            }
        }
    }
});

Vue.component('playlist-videos', {
    props: ['playlists', 'cur_playlist'],
    template: `
    <span v-if="!cur_playlist.videos.length">No videos. Press <i class="fa fa-plus" v-on:click="add = !add"></i> to add one!</span>
    <table width="90%" v-else>
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
            if (confirm("Are you sure you want to remove the video?")) {
                sendPOST("/e/dv/", JSON.stringify([vm.cur_playlist.name, obj.title]));
                vm.cur_playlist.videos.splice(vm.cur_playlist.videos.indexOf(obj), 1);
            }
        }
    }

});


var vm = new Vue({
    el: '#vue-app',
    data: {
        playlists: playlist_data,
        cur_screen: "playlists",
        cur_playlist: null,
        add: false,
        menu_active: false,
    },
    methods: {
        onPlaylistClick(view) {
            this.cur_playlist = view;
            this.cur_screen = "playlist-videos";
        },
        onAdd() {
            name = document.getElementById('add-input').value;
            switch (vm.cur_screen) {
                case "playlists":
                    if (name.includes("youtube.com/playlist")) {
                        content = {
                            url: name,
                            private: false
                        };
                        sendPOST("/e/ip/", JSON.stringify(content), function () {
                            if (this.readyState == 4 && this.status == 200) {
                                vm.playlists = JSON.parse(this.responseText);
                            }
                        });
                    } else {
                        for (var i = 0, len = vm.playlists.length; i < len; i++) {
                            if (name === vm.playlists[i].name) {
                                alert("You already have a playlist with that name! Please choose another one.");
                                return;
                            }
                        }
                        new_playlist = {
                            name: name,
                            private: false,
                            videos: []
                        };
                        vm.playlists.push(new_playlist);
                        sendPOST("/e/np/", JSON.stringify(new_playlist));
                    }
                    break;
                case "playlist-videos":
                    if (!name.includes("youtube.com/watch?v=")) {
                        alert("Not a valid URL! Please try again.");
                        return;
                    }
                    new_video = {
                        url: name,
                        plistname: vm.cur_playlist.name
                    };
                    sendPOST("/e/nv/", JSON.stringify(new_video), function () {
                        if (this.readyState == 4 && this.status == 200) {
                            vm.cur_playlist.videos.push(JSON.parse(this.responseText));
                        }
                    });
                    break;
            }
            vm.add = false;
            document.getElementById('add-input').value = "";
        },
    }
});