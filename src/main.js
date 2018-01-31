import Vue from 'vue';
import player from './components/player.vue';
import editor from './components/editor.vue';
import playlists from './components/playlists.vue';
import videos from './components/videos.vue';
import settings from './components/settings.vue';

const THEMES = ['blue', 'transparent'];

// Prevent document from being seen until it is fully loaded
document.body.hidden = true;

Vue.mixin({
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        // Interact via XMLHTTP request.
        sendRequest(type, location, content, whenReady) {
            var form = new FormData();
            form.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
            if (type === 'POST') form.append('content', content);
            var request = new XMLHttpRequest();
            request.onreadystatechange = whenReady;
            request.open(type, location);
            request.send(form);
        },
    }
})

window.vm = new Vue({
    el: '#vue-app',
    components: {
        player: player,
        editor: editor,
        playlists: playlists,
        videos: videos,
        settings: settings
    },
    data: {
        // --- App state info ---
        themes: THEMES,
        cur_screen: 'playlists',
        editor: false,
        menu_active: false,
        thumbnail: null,

        // --- Playlists/Videos ---
        playlists: JSON.parse(document.getElementById('json').innerHTML),
        // play: playing with the player component; view: looked at with the videos component
        cur_playlist_view: null,
        cur_playlist_play: null,
        new_video: 0,
        
        // --- User preferences ---
        scroll_title: true,
        theme: THEMES[0],
        random: false,
        volume: 25,
    },
    created() {
        // --- Window events
        window.onclick = (event) => {
            if (!event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) this.menu_active = false;
        };

        window.onunload = () => {
            localStorage.setItem('scroll', this.scroll_title);
            localStorage.setItem('volume', this.volume);
            localStorage.setItem('random', this.random);
            localStorage.setItem('theme', this.theme);
        };

        window.onpopstate = this.updateScreen;

        // --- Loading stuff ---
        if (localStorage.getItem('volume') != null) {
            this.volume = localStorage.getItem('volume');
            this.random = localStorage.getItem('random') === 'true';
            this.scroll_title = localStorage.getItem('scroll') === 'true';
            this.theme = localStorage.getItem('theme');
        }

        // Wait for SASS theme to load, then unhide the page hidden at line 7 of this file
        import(`./sass/theme_${this.theme}.sass`).then(() => {
            document.body.hidden = false;
        });

        this.updateScreen();
    },
    methods: {
        // Event handlers
        onNavigate(location) {
            if (window.location.pathname === location) return;
            history.pushState({}, 'MusicTube', location);
            this.updateScreen();
        },
        updateScreen() {
            var uri = window.location.pathname;
            var uri_to_component = {
                '/': 'playlists',
                '/settings/': 'settings',
            }
            this.cur_screen = uri_to_component[uri];

            if (this.cur_screen === undefined) {
                this.cur_playlist_view = this.playlists.filter((obj) => {
                    return obj.id == uri.split('/')[1];
                })[0];
                this.cur_screen = 'videos';
            }
        },
        updateTheme() {
            this.theme = document.getElementById('settings-theme').value;
            if (confirm('The page needs to be reloaded to apply the theme. Reload now?')) location.reload();
        },
    }
});

// TODO: Properly do transition animations again