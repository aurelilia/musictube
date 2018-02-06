<template>
    <nav>
        <div class="logo">
            <img alt="musictube" src="/static/img/logo.png" height="50px" @click="$store.commit('navigate', '/')">
        </div>

        <player class="navbar-content" v-show="!$store.state.editor_active"></player>
        <editor class="navbar-content" v-show="$store.state.editor_active"></editor>

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
