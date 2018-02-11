<template>
    <div class="hamburger-menu">
        <i class="fa fa-bars" @click="$store.commit('toggleMenu')"/>

        <transition name="menu">
            <div id="menu" class="menu-dropdown" v-if="menu_active">
                <a class="menu-item" @click="$store.commit('navigate', '/')">My Playlists</a>
                <a class="menu-item" @click="$store.commit('navigate', '/settings/')">Settings</a>
                <a class="menu-item" href="/logout/">Log out</a>
                <a class="menu-item" @click="$store.commit('toggleEditor')">
                    <i class="fa" :class="{'fa-check-square-o': editor_active, 'fa-square-o': !editor_active}" aria-hidden="true"/>
                    Editor Mode
                </a>
            </div>
        </transition>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'menu_active',
        'editor_active'
    ]),
    mounted () {
        // Close the dropdown menu if the user clicks outside of it
        window.onclick = (event) => {
            if (this.menu_active && !event.target.matches('.menu-item') && !event.target.matches('.fa-bars')) {
                this.$store.commit('toggleMenu', false)
            }
        }
    }
}
</script>

<style lang="sass">
@import '../sass/colors'

.hamburger-menu
    padding-right: 50px

.fa-bars
    font-size: 1.5em

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
