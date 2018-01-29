import Vue from 'vue';
import player from './components/player.vue';
import editor from './components/editor.vue';
import playlists from './components/playlists.vue';
import videos from './components/videos.vue';
import settings from './components/settings.vue';

const THEMES = ['blue', 'transparent'];

// Prevent document from being seen until it is fulled loaded
document.body.hidden = true;


// Close the dropdown menu if the user clicks outside of it
window.onclick = (event) => {
    if (!event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) vm.menu_active = false;
};

// Save user prefrences to localStorage on unload
window.onunload = () => {
    localStorage.setItem('scroll', vm.scroll_title);
    localStorage.setItem('volume', vm.volume);
    localStorage.setItem('random', vm.random);
    localStorage.setItem('theme', vm.theme);
};


/* VUE */
// Get user's playlist data from the HTML the server provided
var playlist_data = JSON.parse(document.getElementById('json').innerHTML);

Vue.component('player', player);
Vue.component('editor', editor);
Vue.component('playlists', playlists);
Vue.component('videos', videos);
Vue.component('settings', settings);

window.vm = new Vue({
    el: '#vue-app',
    data: {
        // --- App state info ---
        themes: THEMES,
        cur_screen: 'playlists',
        editor: false,
        menu_active: false,
        thumbnail: null,

        // --- Playlists/Videos ---
        playlists: playlist_data,
        // play: playing with the player component; view: looked at with the videos component
        cur_playlist_view: null,
        cur_playlist_play: null,
        new_video: 0,
        
        // --- User preferences ---
        scroll_title: true,
        theme: THEMES[0],
    },
    methods: {
        // --- Helper methods ---
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
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

        // Event handlers
        onPlaylistClick(playlist) {
            if (window.location.pathname === `/${playlist.id}/`) return;
            history.pushState({}, playlist.name, playlist.id + '/');
            vm.updateScreen();
        },
        onBackClick() {
            if (window.location.pathname === '/') return;
            history.pushState({}, 'MusicTube', '/');
            vm.updateScreen();
        },
        onSettingsClick() {
            if (window.location.pathname === '/settings/') return;
            history.pushState({}, 'MusicTube', '/settings/');
            vm.updateScreen();
        },
        updateScreen() {
            var uri = window.location.pathname;
            if (uri === '/') {
                vm.cur_screen = 'playlists';
            } else if (uri === '/settings/') {
                vm.cur_screen = 'settings';
            } else {
                vm.cur_playlist_view = vm.playlists.filter((obj) => {
                    return obj.id == uri.split('/')[1];
                })[0];
                vm.cur_screen = 'videos';
            }
        },
        updateTheme() {
            // Maybe consider dynamically loading SASS if that's possible
            vm.theme = document.getElementById('settings-theme').value;
            if (confirm('The page needs to be reloaded to apply the theme. Reload now?')) location.reload();
        },
    }
});


// Update screen on back/forward button click
window.onpopstate = vm.updateScreen;

// Check if preferences are already in local storage; use default value if not
if (localStorage.getItem('volume') != null) {
    vm.volume = localStorage.getItem('volume');
    vm.random = localStorage.getItem('random') === 'true';
    vm.scroll_title = localStorage.getItem('scroll') === 'true';
    vm.theme = localStorage.getItem('theme');
}

// Wait for SASS theme to load, then unhide the page hidden at line 7 of this file
import(`./sass/theme_${vm.theme}.sass`).then(() => {
    document.body.hidden = false;
});

vm.updateScreen();


// TODO: Move out some common functions to another file that can be imported
// TODO: Properly do transition animations again