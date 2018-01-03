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
    var content = document.getElementById("content");
    if (fade) {
        content.classList.toggle("fade");
        await new Promise(resolve => setTimeout(resolve, 700))
        content.innerHTML = newContent;
        content.classList.toggle("fade");
    } else {
    content.innerHTML = this.responseText;
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
    sendXMLHttp(null, null, "/p/" + pid, "GET",
        function () {
            if (this.readyState == 4 && this.status == 200) {
                changeContent(true, this.responseText);
            }
        }
    )
}

// Start playing
function startVideo(title, url) {
    document.getElementById("track-title").innerHTML = title;
    var e = document.createElement("AUDIO");
    e.setAttribute("autoplay", "");
    e.setAttribute("src", url);
    document.body.appendChild(e);
}