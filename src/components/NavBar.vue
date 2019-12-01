<template>
    <nav>
        <img class="logo" alt="musictube" src="/static/img/logo.png" height="50px" @click="$store.dispatch('navigate', '/')">

        <transition-group class="navbar-fade" name="navbar" mode="out-in">
            <player class="navbar-content" v-show="!$store.state.editor_active" key="player" />
            <editor class="navbar-content" v-show="$store.state.editor_active" key="editor" />
        </transition-group>

        <dropdown-menu />
    </nav>
</template>

<script>
import Player from './Player.vue'
import Editor from './Editor.vue'
import DropdownMenu from './DropdownMenu.vue'

export default {
    components: {
        Player,
        Editor,
        DropdownMenu
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

.navbar-fade
    position: relative
    flex: 1
    height: 100%

.navbar-content
    position: absolute
    width: 100%
    height: 100%
    display: flex
    align-items: center

.navbar-enter-active, .navbar-leave-active
    transition: opacity .2s ease-in-out, transform .2s ease-in-out

.navbar-enter
    opacity: 0
    transform: translateY(-75px)

.navbar-leave-to
    opacity: 0
    transform: translateY(75px)

</style>
