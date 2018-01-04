// Interact with server. 
// "type" can be either POST or GET
// "whenReady" is a function executed on state change.
function sendXMLHttp(name, data, location, type, whenReady) {
    var form = new FormData();
    form.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);
    if (name !== null) {
        form.append(name, data);
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open(type, location);
    request.send(form);
}

// Change main page content. Fade it if 1st arg is true
async function changeContent(fade, newContent) {
    if (fade) {
        content.classList.toggle("fade");
        await new Promise(resolve => setTimeout(resolve, 700))
        content.innerHTML = newContent;
        content.classList.toggle("fade");
    } else {
        content.innerHTML = newContent;
    }
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

// View a playlist
async function viewPlaylist(pid) {
    content.classList.toggle("fade");
    sendXMLHttp(null, null, "/p/" + pid, "GET", function () {
        if (this.readyState == 4 && this.status == 200) {
            content_buffer = this.responseText;
        }
    });
    await new Promise(resolve => setTimeout(resolve, 700));
    while (content_buffer === null) {
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    content.innerHTML = content_buffer;
    content_buffer = null;
    content.classList.toggle("fade");
}

// Start playing
function startVideo(title, url) {
    if (audio !== null) {
        if (document.getElementById("track-title").innerHTML === title) {
            audio.play();
            document.getElementById("play-button").innerHTML = '<i class="fa fa-pause"></i>';
            return;
        }
        document.body.removeChild(audio);
    }
    document.getElementById("track-title").innerHTML = title;
    document.getElementById("play-button").innerHTML = '<i class="fa fa-pause"></i>';
    audio = document.createElement("AUDIO");
    audio.setAttribute("autoplay", "");
    audio.setAttribute("src", url);
    document.body.appendChild(audio);
}

// Play/pause
function playPause() {
    if (audio !== null) {
        var button = document.getElementById("play-button");
        if (audio.paused) {
            audio.play();
            button.innerHTML = '<i class="fa fa-pause"></i>';
        } else {
            audio.pause();
            button.innerHTML = '<i class="fa fa-play"></i>';
        }
    }
}

var content = document.getElementById("content");
var content_buffer = null;
var audio = null;

var data = JSON.parse(get_data);

var data = {
    playlists: [{
        name: name,
        videos: [{
            title: title,
            url: url,
            length: length
        }]
    }]
}; // TODO: Get playlist + video info from server.

Vue.component('list-item', {
    props: ['name', 'context'],
    template: `
        <tr> 
            <td class="name">{{ name }}</td>
            <td class="context">{{ context }}</td>
        </tr>
    `
});

var vm = new Vue({
    el: '#content',
    data: data,
    template: `
        <table width="90%">
            <list-item v-for="playlist in playlists" 
                       v-bind:name="playlist.name" 
                       v-bind:context="playlist.videos.length() + 'titles'">
            </list-item>
        </table>
    `
});