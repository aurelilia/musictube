<template>
    <div class="app">
        <div class="bg-img" id="bg-img" :style="`background-image: url(${thumbnail})`"/>

        <nav-bar/>

        <div class="wrapper" id="wrapper">
            <transition name="component" mode="out-in">
                <component class="content" :is="screen"/>
            </transition>
        </div>
    </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Playlists from './components/Playlists.vue'
import Videos from './components/Videos.vue'
import Settings from './components/Settings.vue'
import { mapState } from 'vuex'

export default {
    components: {
        NavBar,
        Playlists,
        Videos,
        Settings
    },
    computed: mapState([
        'thumbnail',
        'screen'
    ]),
    created () {
        window.onunload = () => {
            localStorage.setItem('scroll', this.$store.state.scroll_title)
            localStorage.setItem('volume', this.$store.state.volume)
            localStorage.setItem('random', this.$store.state.random)
        }

        window.onpopstate = () => {
            this.$store.commit('updateCurrentScreen')
        }

        this.$store.commit('updateCurrentScreen')
        this.$store.commit('loadSettings')
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

// Media queries for smaller devices
@media only screen and (max-device-width: 1024px)
    .logo
        display: none

    .controls
        padding-left: 15px

@media only screen and (max-device-width: 768px)
    .volume,
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

@media only screen and (max-device-width: 400px)
    .track-title
        white-space: normal !important

    .position-slider,
    .position-text
        display: none

</style>
