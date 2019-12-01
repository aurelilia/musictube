<template>
    <div class="navbar-content">
        <div class="controls">
            <i class="fa fa-plus edit-icon" @click="addClicked()" />
            <i class="fa fa-search edit-icon" @click="searchClicked()" />
            <form @submit.prevent="onSubmit()">
                <transition name="input-box">
                    <input type="text" class="editor-input" id="editor-input" v-if="add || search" :placeholder="this.text">
                </transition>
            </form>
        </div>
        <span class="exit" @click="$store.commit('toggleEditor')">
            Return to player
        </span>
    </div>
</template>

<script>
import { mapState } from 'vuex'

var axios = require('axios')
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default {
    data: function () {
        return {
            add: false,
            search: false,
            text: ''
        }
    },
    computed: mapState([
        'screen',
        'playlists',
        'playlist_viewing'
    ]),

    methods: {
        addClicked () {
            this.add = !this.add
            this.search = false
            this.text = 'Enter name/URL...'
        },

        searchClicked () {
            this.add = false
            this.search = !this.search
            this.text = 'Enter search term...'
        },

        onSubmit () {
            if (this.$store.getters.screen !== 'playlists' && this.$store.getters.screen !== 'videos') {
                alert('You may not.')
                return
            }

            var text = document.getElementById('editor-input').value
            document.getElementById('editor-input').value = ''

            if (this.add) this.addPlaylist(text)
            else this.searchVideo(text)
        },

        addPlaylist (name) {
            if (name === '') {
                alert('Please enter something.')
                return
            }

            switch (this.$store.getters.screen) {
            case 'playlists':
                if (this.playlists.find((plist) => { return name === plist.name }) !== undefined) {
                    alert('You already have a playlist with that name! Please choose another one.')
                    return
                }
                break
            case 'videos':
                if (!name.includes('youtube.com/watch?v=')) {
                    alert('Not a valid URL! Please try again.')
                    return
                }
                break
            }

            this.$store.dispatch('editorAdd', {
                type: this.$store.getters.screen.slice(0, -1),
                name,
                listid: this.$store.getters.playlist_viewing ? this.$store.getters.playlist_viewing.id : null
            })
        },

        searchVideo (query) {
            if (this.$store.getters.screen === 'playlists') {
                alert('Cannot search for videos on the playlist screen.')
            }
        }
    }
}

</script>

<style lang="sass">
@import ../sass/colors

.edit-icon
    padding: 0 20px
    font-size: 1.3em
    flex: 1

input[type=text]
    border: 0
    border-bottom: 2px solid $wtext
    background-color: rgba(#000, 0)
    color: $wtext
    margin: 20px
    margin-bottom: 0
    font-size: .6em
    font-family: 'Open Sans', sans-serif
    text-align: center

.input-box-enter-active, .input-box-leave-active
    transition: opacity .3s ease-in-out, transform .3s ease-in-out

.input-box-enter, .input-box-leave-to
    opacity: 0
    transform: translateX(-75px)

.exit
    margin: 0 10px
    flex: 1
    text-align: right

</style>
