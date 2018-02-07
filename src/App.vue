<template>
    <div class="app">
        <div class="bg-img" id="bg-img" :style="`background-image: url(${thumbnail})`"></div>

        <nav-bar/>

        <div id="menu-item" class="menu-dropdown" v-show="menu_active">
            <a class="menu-item" @click="$store.commit('navigate', '/')">My Playlists</a>
            <a class="menu-item" @click="$store.commit('navigate', '/settings/')">Settings</a>
            <a class="menu-item" href="/logout/">Log out</a>
            <a class="menu-item" @click="$store.commit('toggleEditor')">
                <i class="fa" :class="{'fa-check-square-o': editor_active, 'fa-square-o': !editor_active}" aria-hidden="true"></i>
                Editor Mode
            </a>
        </div>

        <div class="content">
            <transition name="component-fade" mode="out-in">
                <component :is="screen"/>
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
    computed: mapState([
        'thumbnail',
        'editor_active',
        'menu_active',
        'screen'
    ]),
    components: {
        NavBar,
        Playlists,
        Videos,
        Settings
    },
    created () {
        window.onunload = () => {
            localStorage.setItem('scroll', this.$store.state.scroll_title)
            localStorage.setItem('volume', this.$store.state.volume)
            localStorage.setItem('random', this.$store.state.random)
        }

        window.onpopstate = this.$store.commit('updateCurrentScreen')

        this.$store.commit('updateCurrentScreen')
        this.$store.commit('loadSettings')
    }
}
</script>

<style lang="sass">
@import './sass/colors'

body
    margin: 0 0 5%
    padding: 0
    font-family: 'Open Sans', sans-serif
    background-color: $bg

.content
    margin-top: 120px
    margin-left: auto
    margin-right: auto
    width: 90%

// Both Playlists and Videos component use the same styling, so it's in here.
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

// Transitions
.component-fade-enter-active,
.component-fade-leave-active
  transition: opacity .3s ease

.position-fade-enter-active,
.position-fade-leave-active
  transition: opacity .5s

.component-fade-enter,
.component-fade-leave-to,
.position-fade-enter,
.position-fade-leave-to
  opacity: 0

.navbar-fade-enter-active,
.navbar-fade-leave-active
  transition: color .3s ease

.navbar-fade-enter,
.navbar-fade-leave-to,
.position-fade-enter,
.position-fade-leave-to
    color: $navbar !important

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
