<template>
    <div class="navbar-content">
        <div class="controls">
            <i class="fa fa-plus add-icon" @click="add = !add"/>
            <form @submit.prevent="onAdd()">
                <transition name="add-box">
                    <input type="text" class="add-input" id="add-input" v-if="add" placeholder="Enter name/URL...">
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
            add: false
        }
    },
    computed: mapState([
        'screen',
        'playlists',
        'playlist_viewing'
    ]),

    methods: {
        onAdd () {
            var name = document.getElementById('add-input').value

            if (name === '') {
                alert('Please enter a name/URL.')
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

            this.add = false
            document.getElementById('add-input').value = ''
        }
    }
}

</script>

<style lang="sass">
@import ../sass/colors

.add-icon
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

.add-box-enter-active, .add-box-leave-active
    transition: opacity .3s ease-in-out, transform .3s ease-in-out

.add-box-enter, .add-box-leave-to
    opacity: 0
    transform: translateX(-75px)

.exit
    margin: 0 10px
    flex: 1
    text-align: right

</style>
