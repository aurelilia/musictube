<template>
    <nav>
        <div class="logo">
            <img alt="musictube" src="/static/img/logo.png" height="50px" @click="$store.commit('navigate', '/')">
        </div>

        <transition-group class="navbar-fade" name="navbar" mode="out-in">
            <player class="navbar-content" v-show="!$store.state.editor_active" key="player"/>
            <editor class="navbar-content" v-show="$store.state.editor_active" key="editor"/>
        </transition-group>

        <div class="hamburger-menu">
            <i class="fa fa-bars" @click="$store.commit('toggleMenu')"></i>
        </div>
    </nav>
</template>

<script>
import Player from './Player.vue'
import Editor from './Editor.vue'

export default {
    components: {
        Player,
        Editor
    }
}
</script>

<style lang="sass">
@import '../sass/colors'

nav
    overflow: hidden
    margin: 0
    padding: 0
    width: 100%
    height: 75px
    top: 0
    background-color: $navbar
    box-shadow: 0 5px 10px 3px $shadow
    position: fixed
    display: flex
    justify-content: flex-start
    align-items: center
    color: $wtext
    z-index: 100

.logo
   padding: 0 50px

.hamburger-menu
    font-size: 1.5em
    padding-right: 50px

.navbar-fade
    position: relative
    flex: 1
    height: 100%

.navbar-content
    position: absolute
    width: 100%
    height: 100%

.navbar-enter-active, .navbar-leave-active
    transition: opacity .2s ease-in-out, transform .2s ease-in-out

.navbar-enter
    opacity: 0
    transform: translateY(-75px)

.navbar-leave-to
    opacity: 0
    transform: translateY(75px)

</style>
