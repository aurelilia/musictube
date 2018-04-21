<template>
    <div class="settings">
        <span class="settings-title">Settings</span>

        <a class="checkbox" @click="$store.commit('toggleScrolling')">
            <i class="fa" :class="{'fa-check-square-o': scroll_title, 'fa-square-o': !scroll_title}" aria-hidden="true"/>
            Scroll tab title
        </a>

        <a class="checkbox" @click="$store.commit('toggleThumbnail')">
            <i class="fa" :class="{'fa-check-square-o': use_video_thumbnail, 'fa-square-o': !use_video_thumbnail}" aria-hidden="true"/>
            Show thumbnail of currently playing video in background
        </a>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'scroll_title',
        'use_video_thumbnail'
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
    text-align: center
    font-size: 1.3em

</style>
