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
    document.getElementById("track-title").innerHTML = title;
    document.getElementById("play-button").innerHTML = '<i class="fa fa-pause"></i>';
    e = document.createElement("AUDIO");
    e.setAttribute("autoplay", "");
    e.setAttribute("src", url);
    document.body.appendChild(e);
}

// Play/pause
function playPause() {
    if (e !== null) {
        var button = document.getElementById("play-button");
        if (e.paused) {
            e.play();
            button.innerHTML = '<i class="fa fa-pause"></i>';
        } else {
            e.pause();
            button.innerHTML = '<i class="fa fa-play"></i>';
        }
    }
}

var content = document.getElementById("content");
var content_buffer = null;
var e = null;