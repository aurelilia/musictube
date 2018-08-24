<template>
    <div class="settings">
        <span class="settings-title">Settings</span>

        <a class="checkbox menu-item" @click="$store.commit('toggleSetting', 'scroll_title')">
            <i class="fa" :class="{'fa-check-square-o': settings.scroll_title, 'fa-square-o': !settings.scroll_title}" aria-hidden="true"/>
            Scroll tab title
        </a>

        <a class="checkbox menu-item" @click="$store.commit('toggleSetting', 'use_video_thumbnail')">
            <i class="fa" :class="{'fa-check-square-o': settings.use_video_thumbnail, 'fa-square-o': !settings.use_video_thumbnail}" aria-hidden="true"/>
            Show thumbnail of currently playing video in background
        </a>

        <span>
            Background Image:
            <input type="number" class="number-box" min="1" max="3"
                @change="$store.commit('setSetting', { setting: 'bg_image', val: $event.target.value })" :value="settings.bg_image">
            <a class="checkbox menu-item bg-img-box" @click="$store.commit('toggleSetting', 'bg_custom')">
                <i class="fa" :class="{'fa-check-square-o': settings.bg_custom, 'fa-square-o': !settings.bg_custom}" aria-hidden="true"/>
                Custom Background
            </a>
            <input type="url" class="url-box" :active="settings.bg_custom"
                @change="$store.commit('setSetting', { setting: 'bg_url', val: $event.target.value })" :value="settings.bg_url">

        </span>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'settings'
    ])
}
</script>

<style lang="sass">
@import '../sass/colors'

.settings
    padding: 20px
    box-shadow: 0 5px 10px 3px $shadow
    color: $settings-text
    background-color: $tr

.settings-title
    margin: 0
    padding: 0
    font-size: 1.3em

.number-box, .url-box
    background-color: rgba(#000, 0)
    color: $wtext
    border: 0
    width: 45px
    border-bottom: 1px solid $wtext
    margin-right: 20px

.url-box
    width: 400px
    margin: 0 5px

.url-box:invalid
    border: 2px red

.bg-img-box
    display: inline

</style>
