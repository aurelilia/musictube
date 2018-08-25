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

// ZZZ...
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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

        loaded: false,
        editor_active: false,
        menu_active: false,
        video_player_active: false,

        playlists: [],
        playlist_playing: null,

        video_playing: null,
        playing: false,
        video_thumbnail: '',

        scroller_interval_id: null,
        settings: {
            scroll_title: true,
            random: false,
            volume: 25,
            use_video_thumbnail: false,
            bg_image: '1',
            bg_custom: false,
            bg_url: ''
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
        setVolume (state, vol) {
            vol = vol < 0 ? 0 : vol
            vol = vol > 100 ? 100 : vol
            state.settings.volume = vol
            document.getElementById('volume-box').value = vol
            document.getElementById('volume-slider').value = vol
            state.player.e.volume = vol / 400
        },

        // Temporary settables/toggleables
        loaded: toggleGen('loaded'),
        setThumbnail: setterGen('video_thumbnail'),
        setUri: setterGen('uri'),
        setScrollerId: setterGen('scroller_interval_id'),
        setPlaylists: setterGen('playlists'),
        toggleMenu: toggleGen('menu_active'),
        toggleEditor: toggleGen('editor_active'),
        togglePlaying (state, force) {
            // If no track is playing, don't allow to resume
            if (!state.player.e.src && !state.playing) return
            state.playing = force !== undefined ? force : !state.playing
            state.playing ? state.player.e.play() : state.player.e.pause()
        },

        // Player-related
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
        }
    },
    actions: {
        setupPlayer ({ state, commit }) {
            state.player.e = document.getElementById('player')
            state.player.e.pause()
            state.player.e.addEventListener('timeupdate', () => {
                this.commit('updatePlayerPosition', Math.floor(state.player.e.currentTime))
            })
            state.player.e.addEventListener('ended', () => {
                this.dispatch('shiftCurrentTrackByIndex', 1)
            })
            commit('setVolume', state.settings.volume)
        },
        updateCurrentTrack ({ state, commit, dispatch }, { playlist, video, force }) {
            if (state.video_playing === video && !force) return
            commit('togglePlaying', false)
            commit('setCurrentTrack', { playlist, video })
            dispatch('updateThumbnail')
            dispatch('setWindowTitle', video.title)
            var type = state.video_player_active ? 'video' : 'audio'
            axios.get(`/api/get${type}?url=${video.url}`).then(function ({ data }) {
                commit('setPlayerSource', data)
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
                // If the big thumbnail isn't available, YouTube responds with a smaller broken thumbnail image.
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
        async toggleVideoPlayer ({ state, dispatch }) {
            state.video_player_active = !state.video_player_active
            // Vue takes a bit to update DOM (needed for getting the player element)
            await sleep(50)
            dispatch('setupPlayer')
            dispatch('updateCurrentTrack', { playlist: state.playlist_playing, video: state.video_playing, force: true })
            state.player.e.currentTime = state.player.position
            if (state.video_player_active) document.getElementById('wrapper').scrollTop = 0
        },

        editorAdd ({ dispatch }, { type, name, listid }) {
            axios.post('/api/add' + type, { name, listid }).then(function () {
                dispatch('reloadPlaylists')
            })
        },
        editorDelete ({ dispatch }, { type, videoid, listid }) {
            if (!confirm('Are you sure?')) return
            axios.post('/api/delete' + type, { videoid, listid }).then(function () {
                dispatch('reloadPlaylists')
            })
        },
        editorRename ({ dispatch }, { type, videoid, listid }) {
            var name = prompt('Enter a new name for the playlist:')
            if (!name) return
            axios.post('/api/rename' + type, { videoid, listid, name }).then(function () {
                dispatch('reloadPlaylists')
            })
        },

        navigate ({ state, commit }, location) {
            if (window.location.pathname === location) return
            history.pushState({}, 'MusicTube', location)
            commit('setUri', window.location.pathname)
        },
        reloadPlaylists ({commit}) {
            axios.get('/api/fetchplaylists').then(function ({ data }) {
                commit('setPlaylists', data)
                commit('loaded', true)
            })
        }
    },
    getters: {
        current_bg (state) {
            if (!state.settings.use_video_thumbnail || state.video_playing === null) {
                if (state.settings.bg_custom) return state.settings.bg_url
                return require('./assets/bg' + state.settings.bg_image + '.jpg')
            }
            return state.video_thumbnail
        },
        screen (state) {
            if (!state.loaded) return null
            var uri_to_component = {
                '/': 'playlists',
                '/settings/': 'settings',
                '/about/': 'about'
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
