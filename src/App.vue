<template>
    <div class="app">
        <div class="bg-img" id="bg-img" :style="`background-image: url(${$store.getters.current_bg})`"/>
        <audio id="player" autoplay/>
        <nav-bar/>

        <div class="wrapper" id="wrapper">
            <transition name="component" mode="out-in">
                <component class="content" :is="$store.getters.screen"/>
            </transition>
        </div>
    </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Playlists from './components/Playlists.vue'
import Videos from './components/Videos.vue'
import Settings from './components/Settings.vue'
import About from './components/About.vue'


export default {
    components: {
        NavBar,
        Playlists,
        Videos,
        Settings,
        About
    },
    mounted () {
        window.onunload = () => {
            localStorage.setItem('settings', JSON.stringify(this.$store.state.settings))
        }
        window.onpopstate = () => {
            this.$store.commit('setUri', window.location.pathname)
        }
        window.onkeydown = (e) => {
            // Pause when space is pressed (and editor not active).
            // TODO: Figure out why Vue ignores @keydown event handlers...
            if (e.keyCode === 32 && !this.$store.state.editor_active) {
                e.preventDefault()
                this.$store.commit('togglePlaying')
            }
        }

        this.$store.dispatch('reloadPlaylists')
        this.$store.commit('loadSettings')
        this.$store.commit('setupPlayer')
    }
}
</script>

<style lang="sass">
@import './sass/colors'

body
    margin: 0 0
    font-family: 'Open Sans', sans-serif
    background-color: $bg
    overflow: visible

.bg-img
    position: fixed
    top: -1%
    left: -1%
    right: 0
    z-index: -1

    display: block
    background-size: cover
    width: 102%
    height: 102%

    filter: blur(7px)

.wrapper
    position: fixed
    top: 0
    padding-top: 75px
    overflow: auto
    width: 100%
    height: calc(100% - 75px)
    scroll-behavior: smooth

.content
    margin: 45px auto 60px
    width: 90%
    overflow: visible

// Both Playlists and Videos component use the same styling, so it's in here.
.no-avail
    position: fixed
    text-align: center
    color: $wtext
    top: 90px
    width: 100%

table
    width: 100%
    box-shadow: 0 5px 10px 3px $shadow

tr
    background-color: $tr
    color: $wtext

tr:hover
    background-color: $tr-hover

td
    padding: 10px

tr .name
    width: 85%

tr .delete,
.rename
    width: 3%
    text-align: center
    font-size: 1.25em

.component-enter-active, .component-leave-active, .menu-enter-active, .menu-leave-active
    transition: opacity .3s ease-in-out, transform .3s ease-in-out

.component-enter
    opacity: 0
    transform: translateX(-75px)

.component-leave-to, .menu-enter, .menu-leave-to
    opacity: 0
    transform: translateX(75px)

@media only screen and (max-device-width: 1024px)
    .logo,
    .volume
        display: none

    .controls
        padding-left: 25px

@media only screen and (max-device-width: 768px)
    .playlist-thumb,
    .thumb,
    .thumb-nav
        display: none

    .track
        overflow: hidden
        padding: 2px 5px
        width: 100%
        height: 50px
        bottom: 0
        background-color: $navbar
        position: fixed
        color: $wtext
        z-index: 100

    .track-title
        white-space: nowrap

    .position-slider
        width: 70% !important

    body
        margin-bottom: 60px

    .content
        margin-top: 85px

</style>
