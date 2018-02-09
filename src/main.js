import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'

// Interact via XMLHTTP request.
function sendRequest (type, location, content, whenReady) {
    var form = new FormData()
    form.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value)
    if (type === 'POST') form.append('content', content)
    var request = new XMLHttpRequest()
    request.onreadystatechange = whenReady
    request.open(type, location)
    request.send(form)
}

// Generate store mutator for toggling a boolean. If a value is specified, force it instead of flipping
function toggleGen (prop) {
    return function (state, force) {
        state[prop] = force !== undefined ? force : !state[prop]
    }
}

// Generate store mutator for setting state prop to argument.
function setterGen (prop) {
    return function (state, val) {
        state[prop] = val
    }
}

Vue.use(Vuex)
Vue.mixin({
    methods: {
        formatSeconds (secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5)
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
        thumbnail: require('./assets/bg.jpg'),
        video_thumbnail: true,

        scroll_title: true,
        random: false,
        volume: 25
    },
    mutations: {
        loadSettings (state) {
            if (localStorage.getItem('volume') != null) {
                state.volume = localStorage.getItem('volume')
                state.random = localStorage.getItem('random') === 'true'
                state.scroll_title = localStorage.getItem('scroll') === 'true'
                state.video_thumbnail = localStorage.getItem('thumbnailbg') === 'true'
            }
        },
        toggleMenu: toggleGen('menu_active'),
        toggleEditor: toggleGen('editor_active'),
        toggleScrolling: toggleGen('scroll_title'),
        toggleThumbnail: toggleGen('video_thumbnail'),
        toggleRandom: toggleGen('random'),
        togglePlaying: toggleGen('playing'),
        setPlaylists: setterGen('playlists'),
        setThumbnail: setterGen('thumbnail'),
        setVolume: setterGen('volume'),
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
        },
        updateCurrentTrackByIndex (state, index) {
            if (state.playlist_playing.videos[index] === state.video_playing) return

            if (state.random) index = Math.floor((Math.random() * state.playlist_playing.videos.length))
            if (index < 0 || index >= state.playlist_playing.videos.length) index = 0

            state.video_playing = state.playlist_playing.videos[index]
        },
        deletePlaylist (state, playlist) {
            if (confirm('Are you sure you want to delete the playlist?')) {
                sendRequest('POST', '/e/dp/', playlist.name)
                state.playlists.splice(state.playlists.indexOf(playlist), 1)
            }
        },
        renamePlaylist (state, playlist) {
            var new_name = prompt('Enter a new name for the playlist:')
            if (new_name !== null && new_name !== '') {
                sendRequest('POST', '/e/rp/', JSON.stringify({
                    'old': playlist.name,
                    'new': new_name
                }))
                state.playlists[state.playlists.indexOf(playlist)].name = new_name
            }
        },
        addVideoToPlaylist (state, video) {
            state.playlist_viewing.videos = state.playlist_viewing.videos.concat(video)
        },
        deleteVideo (state, video) {
            if (confirm('Are you sure you want to remove the video?')) {
                sendRequest('POST', '/e/dv/', JSON.stringify([state.playlist_viewing.name, video.title]))
                state.playlist_viewing.videos.splice(state.playlist_viewing.videos.indexOf(video), 1)
            }
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
