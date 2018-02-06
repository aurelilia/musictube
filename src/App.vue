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
    }
}
</script>
