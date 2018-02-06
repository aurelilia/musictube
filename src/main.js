import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';

// Prevent document from being seen until it is fully loaded
document.body.hidden = true;

// Interact via XMLHTTP request.
function sendRequest(type, location, content, whenReady) {
    var form = new FormData();
    form.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
    if (type === 'POST') form.append('content', content);
    var request = new XMLHttpRequest();
    request.onreadystatechange = whenReady;
    request.open(type, location);
    request.send(form);
}

Vue.use(Vuex)
Vue.mixin({
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        sendRequest
    }
})

const store = new Vuex.Store({
    state: {
        screen: 'playlists',
        editor_active: false,
        menu_active: false,

        playlists: JSON.parse(document.getElementById('json').innerHTML),
        playlist_playing: null,
        playlist_viewing: null,

        video_playing: null,
        playing: false,
        thumbnail: null,

        scroll_title: true,
        random: false,
        volume: 25
    },
    mutations: {
        loadSettings(state) {
            if (localStorage.getItem('volume') != null) {
                state.volume = localStorage.getItem('volume');
                state.random = localStorage.getItem('random') === 'true';
                state.scroll_title = localStorage.getItem('scroll') === 'true';
            }
        },
        navigate(state, location) {
            if (window.location.pathname === location) return;
            history.pushState({}, 'MusicTube', location);
            this.commit('updateCurrentScreen');
        },
        updateCurrentScreen(state) {
            var uri = window.location.pathname;
            var uri_to_component = {
                '/': 'playlists',
                '/settings/': 'settings',
            }
            state.screen = uri_to_component[uri];

            if (state.screen == undefined) {
                state.playlist_viewing = state.playlists.find((list) => {
                    return list.id == uri.split('/')[1];
                });
                state.screen = 'videos';
            }
            state.menu_active = false;
        },
        updateCurrentTrack(state, { playlist, video }) {
            state.video_playing = video;
            state.playlist_playing = playlist;
        },
        updateCurrentTrackByIndex(state, index) {
            if (state.playlist_playing.videos[index] === state.video_playing) return;
            if (state.random) {
                index = Math.floor((Math.random() * state.playlist_playing.videos.length) + 1);
            }
            if (index >= 0 && index < state.playlist_playing.videos.length) {
                state.video_playing = state.playlist_playing.videos[index];
            } else {
                state.video_playing = state.playlist_playing.videos[0];
            }
        },
        toggleMenu(state) {
            state.menu_active = !state.menu_active;
        },
        toggleEditor(state) {
            state.editor_active = !state.editor_active;
        },
        toggleScrolling(state) {
            state.scroll_title = !state.scroll_title;
        },
        toggleRandom(state) {
            state.random = !state.random;
        },
        togglePlaying(state, play) {
            state.playing = play != undefined ? play : !state.playing;
        },
        setTheme(state, theme) {
            localStorage.setItem('theme', theme);
            if (confirm('The page needs to be reloaded to apply the theme. Reload now?')) location.reload();
        },
        setPlaylists(state, playlists) {
            state.playlists = playlists;
        },
        setThumbnail(state, thumbnail) {
            state.thumbnail = thumbnail;
        },
        setVolume(state, vol) {
            state.volume = vol;
        },
        addVideoToPlaylist(state, video) {
            state.playlist_viewing.videos = state.playlist_viewing.videos.concat(video);
        },
        deletePlaylist(state, playlist) {
            if (confirm('Are you sure you want to delete the playlist?')) {
                sendRequest('POST', '/e/dp/', playlist.name);
                state.playlists.splice(state.playlists.indexOf(playlist), 1);
            }
        },
        renamePlaylist(state, playlist) {
            var list_name = prompt('Enter a new name for the playlist:');
            if (list_name !== null && list_name !== '') {
                sendRequest('POST', '/e/rp/', JSON.stringify({
                    'old': playlist.name,
                    'new': list_name
                }));
                state.playlists[state.playlists.indexOf(playlist)].name = list_name;
            }
        },
        deleteVideo(state, video) {
            if (confirm('Are you sure you want to remove the video?')) {
                sendRequest('POST', '/e/dv/', JSON.stringify([state.playlist_viewing.name, video.title]));
                state.playlist_viewing.videos.splice(state.playlist_viewing.videos.indexOf(video), 1);
            }
        }
    }
})

new Vue({
    el: '#vue-app',
    components: { App },
    store,
    template: `<App/>`,
    created() {
        window.onunload = () => {
            localStorage.setItem('scroll', this.$store.state.scroll_title);
            localStorage.setItem('volume', this.$store.state.volume);
            localStorage.setItem('random', this.$store.state.random);
        };

        window.onpopstate = this.$store.commit('updateCurrentScreen');

        var theme = localStorage.getItem('theme');
        import(`./sass/theme_${theme == undefined ? 'transparent' : theme}.sass`).then(() => {
            document.body.hidden = false;
        });

        this.$store.commit('updateCurrentScreen');
        this.$store.commit('loadSettings');
    }
});
