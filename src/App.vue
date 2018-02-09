<template>
    <div class="app">
        <div class="bg-img" id="bg-img" :style="`background-image: url(${thumbnail})`"></div>

        <nav-bar/>

        <transition name="menu">
            <div id="menu" class="menu-dropdown" v-if="menu_active">
                <a class="menu-item" @click="$store.commit('navigate', '/')">My Playlists</a>
                <a class="menu-item" @click="$store.commit('navigate', '/settings/')">Settings</a>
                <a class="menu-item" href="/logout/">Log out</a>
                <a class="menu-item" @click="$store.commit('toggleEditor')">
                    <i class="fa" :class="{'fa-check-square-o': editor_active, 'fa-square-o': !editor_active}" aria-hidden="true"></i>
                    Editor Mode
                </a>
            </div>
        </transition>

        <div class="wrapper">
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

        window.onpopstate = () => {
            // Assigning commit directly doesn't work.
            this.$store.commit('updateCurrentScreen')
        }

        // Close the dropdown menu if the user clicks outside of it
        window.onclick = (event) => {
            if (this.menu_active && !event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) {
                this.$store.commit('toggleMenu', false)
            }
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
    top: 75px
    overflow: auto
    width: 100%
    height: calc(100% - 75px)

.content
    margin: 45px auto 60px
    width: 90%
    overflow: visible

.menu-dropdown
    position: fixed
    right: 0
    background-color: $menu
    min-width: 200px
    box-shadow: 0 5px 10px 3px $shadow
    z-index: 100
    top: 75px

a
    color: $menu-link
    padding: 12px 16px
    text-decoration: none
    display: block

a:hover
    background-color: $menu-hover
    cursor: default

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
