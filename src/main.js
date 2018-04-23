import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
var axios = require('axios')
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

// Return store mutator for toggling a boolean. If a value is specified, force it instead of flipping
function toggleGen (prop) {
    return function (state, force) {
        state[prop] = force !== undefined ? force : !state[prop]
    }
}

Vue.use(Vuex)
Vue.mixin({
    methods: {
        formatSeconds (secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5)
        }
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
        video_thumbnail: '',

        settings: {
            scroll_title: true,
            random: false,
            volume: 25,
            use_video_thumbnail: true
        }
    },
    mutations: {
        loadSettings (state) {
            if (localStorage.getItem('settings') != null) {
                state.settings = JSON.parse(localStorage.getItem('settings'))
            }
        },
        toggleSetting (state, setting) {
            state.settings[setting] = !state.settings[setting]
        },
        setSetting (state, { setting, val }) {
            state.settings[setting] = val
        },
        addPlaylist (state, playlist) {
            state.playlists.push(playlist)
        },
        toggleMenu: toggleGen('menu_active'),
        toggleEditor: toggleGen('editor_active'),
        togglePlaying: toggleGen('playing'),
        navigate (state, location) {
            if (window.location.pathname === location) return
            history.pushState({}, 'MusicTube', location)
            this.commit('updateCurrentScreen')
        },
        updateCurrentScreen (state) {
            var uri = window.location.pathname
            var uri_to_component = {
                '/': 'playlists',
                '/settings/': 'settings'
            }
            state.screen = uri_to_component[uri]

            if (state.screen === undefined) {
                state.playlist_viewing = state.playlists.find((list) => {
                    return list.id === parseInt(uri.split('/')[1])
                })
                state.screen = 'videos'
            }
        },
        updateCurrentTrack (state, { playlist, video }) {
            state.video_playing = video
            state.playlist_playing = playlist
            this.commit('updateThumbnail')
        },
        updateCurrentTrackByIndex (state, index) {
            if (state.playlist_playing.videos[index] === state.video_playing) return

            if (state.settings.random) index = Math.floor((Math.random() * state.playlist_playing.videos.length))
            if (index < 0 || index >= state.playlist_playing.videos.length) index = 0

            state.video_playing = state.playlist_playing.videos[index]
            this.commit('updateThumbnail')
        },
        updateThumbnail (state) {
            // YouTube maxresdefault thumbnails sometimes aren't available, so we fallback to mqdefault.
            var image = new Image()
            image.onload = function () {
                if (('naturalHeight' in image && image.naturalHeight <= 90) || image.height <= 90) {
                    state.video_thumbnail = `https://i.ytimg.com/vi/${state.video_playing.url}/mqdefault.jpg`
                } else {
                    state.video_thumbnail = `https://i.ytimg.com/vi/${state.video_playing.url}/maxresdefault.jpg`
                }
            }
            image.src = `https://i.ytimg.com/vi/${state.video_playing.url}/maxresdefault.jpg`
        },
        deletePlaylist (state, playlist) {
            if (confirm('Are you sure you want to delete the playlist?')) {
                axios.post('/e/dp/', { name: playlist.name })
                state.playlists.splice(state.playlists.indexOf(playlist), 1)
            }
        },
        renamePlaylist (state, playlist) {
            var new_name = prompt('Enter a new name for the playlist:')
            if (new_name !== null && new_name !== '') {
                axios.post('/e/rp/', {
                    'old': playlist.name,
                    'new': new_name
                })
                state.playlists[state.playlists.indexOf(playlist)].name = new_name
            }
        },
        addVideoToPlaylist (state, video) {
            state.playlist_viewing.videos.push(video)
        },
        deleteVideo (state, video) {
            if (confirm('Are you sure you want to remove the video?')) {
                axios.post('/e/dv/', {
                    playlist: state.playlist_viewing.name,
                    video: video.title
                })
                state.playlist_viewing.videos.splice(state.playlist_viewing.videos.indexOf(video), 1)
            }
        }
    },
    getters: {
        current_bg (state) {
            // Use default
            if (!state.settings.use_video_thumbnail || state.video_playing === null) return require('./assets/bg.jpg')
            return state.video_thumbnail
        }
    }
})

// eslint-disable-next-line
new Vue({
    el: '#vue-app',
    components: { App },
    store,
    template: `<App/>`
})
