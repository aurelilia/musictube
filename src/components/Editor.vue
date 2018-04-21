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
            var input = document.getElementById('add-input').value
            if (input === '') {
                alert('Please enter a name.')
                return
            }
            var that = this

            switch (this.screen) {
            case 'playlists':
                var playlists = this.playlists

                if (input.includes('youtube.com/playlist')) {
                    var content = {
                        url: input,
                        private: false
                    }
                    this.sendRequest('POST', '/e/ip/', JSON.stringify(content), function () {
                        if (this.readyState === 4 && this.status === 200) {
                            that.$store.commit('setPlaylists', JSON.parse(this.responseText))
                        }
                    })
                } else {
                    if (this.playlists.find((plist) => {
                        return input === plist.name
                    }) !== undefined) {
                        alert('You already have a playlist with that name! Please choose another one.')
                        return
                    }
                    var new_playlist = {
                        name: input
                    }
                    this.sendRequest('POST', '/e/np/', JSON.stringify(new_playlist), function () {
                        if (this.readyState === 4 && this.status === 200) {
                            playlists.push(JSON.parse(this.responseText))
                            that.$store.commit('setPlaylists', playlists)
                        }
                    })
                }
                break
            case 'videos':
                var playlist = this.playlist_viewing
                if (!input.includes('youtube.com/watch?v=')) {
                    alert('Not a valid URL! Please try again.')
                    return
                }

                var new_video = {
                    url: input,
                    plistname: playlist.name
                }
                this.sendRequest('POST', '/e/nv/', JSON.stringify(new_video), function () {
                    if (this.readyState === 4 && this.status === 200) {
                        that.$store.commit('addVideoToPlaylist', JSON.parse(this.responseText))
                    }
                })
                break
            }
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
