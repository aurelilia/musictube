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
        }
    }
})

const store = new Vuex.Store({
    state: {
        // Vuex won't update getters when using window.location.pathname directly. Auto-updated on navigation.
        uri: window.location.pathname,

        editor_active: false,
        menu_active: false,

        playlists: JSON.parse(document.getElementById('json').innerHTML),
        playlist_playing: null,

        video_playing: null,
        playing: false,
        video_thumbnail: '',

        scroller_interval_id: null,
        settings: {
            scroll_title: true,
            random: false,
            volume: 25,
            use_video_thumbnail: true
        },

        player: {
            e: null,
            position: 0
        }
    },
    mutations: {
        // Settings
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

        // Temporary settables/toggleables
        setThumbnail: setterGen('video_thumbnail'),
        setUri: setterGen('uri'),
        setScrollerId: setterGen('scroller_interval_id'),
        toggleMenu: toggleGen('menu_active'),
        toggleEditor: toggleGen('editor_active'),
        togglePlaying (state, force) {
            // If no track is playing, don't allow to resume
            if (!state.player.e.src && !state.playing) return
            state.playing = force !== undefined ? force : !state.playing
            state.playing ? state.player.e.play() : state.player.e.pause()
        },

        // Player-related
        setupPlayer (state) {
            state.player.e = document.getElementById('player')
            state.player.e.pause()
            state.player.e.addEventListener('timeupdate', () => {
                this.commit('updatePlayerPosition', Math.floor(state.player.e.currentTime))
            })
            state.player.e.addEventListener('ended', () => {
                this.dispatch('shiftCurrentTrackByIndex', 1)
            })
            state.player.e.volume = state.settings.volume / 400
        },
        updatePlayerPosition (state, pos) {
            state.player.position = pos
        },
        setCurrentTrack (state, { playlist, video }) {
            state.video_playing = video
            state.playlist_playing = playlist
            state.player.e.currentTime = 0
        },
        setPlayerSource (state, src) {
            state.player.e.setAttribute('src', src)
        },

        // Playlist/Video modification
        addPlaylist (state, playlist) {
            state.playlists.push(playlist)
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
            this.getters.playlist_viewing.videos.push(video)
        },
        deleteVideo (state, video) {
            if (confirm('Are you sure you want to remove the video?')) {
                axios.post('/e/dv/', {
                    playlist: this.getters.playlist_viewing.name,
                    video: video.title
                })
                this.getters.playlist_viewing.videos.splice(this.getters.playlist_viewing.videos.indexOf(video), 1)
            }
        }
    },
    actions: {
        updateCurrentTrack ({ state, commit, dispatch }, { playlist, video }) {
            if (state.video_playing === video) return
            commit('togglePlaying', false)
            commit('setCurrentTrack', { playlist, video })
            dispatch('updateThumbnail')
            dispatch('setWindowTitle', video.title)

            axios.get('/u/' + video.url).then(function ({ data }) {
                commit('setPlayerSource', data['url'])
                commit('togglePlaying', true)
            })
        },
        shiftCurrentTrackByIndex ({ state, dispatch }, shift) {
            var index = state.playlist_playing.videos.indexOf(state.video_playing) + shift
            if (state.settings.random) index = Math.floor((Math.random() * state.playlist_playing.videos.length))
            if (index < 0 || index >= state.playlist_playing.videos.length) index = 0

            dispatch('updateCurrentTrack', {
                'playlist': state.playlist_playing,
                'video': state.playlist_playing.videos[index]
            })
        },
        updateThumbnail ({ state, commit }) {
            // YouTube maxresdefault thumbnails sometimes aren't available, so we fallback to mqdefault.
            var image = new Image()
            image.onload = function () {
                if (('naturalHeight' in image && image.naturalHeight <= 90) || image.height <= 90) {
                    commit('setThumbnail', `https://i.ytimg.com/vi/${state.video_playing.url}/mqdefault.jpg`)
                } else {
                    commit('setThumbnail', `https://i.ytimg.com/vi/${state.video_playing.url}/maxresdefault.jpg`)
                }
            }
            image.src = `https://i.ytimg.com/vi/${state.video_playing.url}/maxresdefault.jpg`
        },
        setWindowTitle ({ state, commit, dispatch }, text) {
            clearTimeout(state.scroller_interval_id)
            document.title = text
            if (state.settings.scroll_title && text !== 'MusicTube') {
                commit('setScrollerId', setTimeout(() => {
                    dispatch('setWindowTitle', text.substr(1) + text.substr(0, 1))
                }, 500))
            }
        },

        navigate ({ state, commit }, location) {
            if (window.location.pathname === location) return
            history.pushState({}, 'MusicTube', location)
            commit('setUri', window.location.pathname)
        }
    },
    getters: {
        current_bg (state) {
            if (!state.settings.use_video_thumbnail || state.video_playing === null) return require('./assets/bg.jpg')
            return state.video_thumbnail
        },
        screen (state) {
            var uri_to_component = {
                '/': 'playlists',
                '/settings/': 'settings'
            }
            return uri_to_component[state.uri] !== undefined ? uri_to_component[state.uri] : 'videos'
        },
        playlist_viewing (state) {
            return state.playlists.find((list) => {
                return list.id === parseInt(state.uri.split('/')[1])
            })
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
