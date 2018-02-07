<template>
    <nav>
        <div class="logo">
            <img alt="musictube" src="/static/img/logo.png" height="50px" @click="$store.commit('navigate', '/')">
        </div>

        <player class="navbar-content" v-show="!$store.state.editor_active"/>
        <editor class="navbar-content" v-show="$store.state.editor_active"/>

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

</style>
