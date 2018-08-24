<template>
    <div class="player">

        <div class="controls">
            <i id="prev-button" class="fa fa-backward" @click="$store.dispatch('shiftCurrentTrackByIndex', -1)"/>
            <i id="play-button" class="fa" :class="{'fa-pause': playing, 'fa-play': !playing}" @click="$store.commit('togglePlaying')"/>
            <i id="random-button" class="fa fa-random" @click="$store.commit('toggleSetting', 'random')" :class="{ 'grey': !random }"/>
            <i id="next-button" class="fa fa-forward" @click="$store.dispatch('shiftCurrentTrackByIndex', 1)"/>
        </div>

        <div class="track" v-if="video_playing !== null">
            <div class="thumb-nav">
                <img :src="`https://i.ytimg.com/vi/${video_playing.url}/mqdefault.jpg`" height="50px">
            </div>
            <div class="track-info">
                <span class="track-title" id="track-title">{{ video_playing.title }}</span>
                <span class="position">
                    <p class="position-text">{{ formatSeconds(player.position) }} / {{ formatSeconds(video_playing.length) }}</p>
                    <input type="range" class="position-slider" id="position-slider" min="0" :max="video_playing.length"
                            step="video_playing.length / 100" @input="player.e.currentTime = Math.floor($event.target.value)"
                            :value="player.position">
                </span>
                </div>
        </div>
        <div class="track" v-else>No track playing.</div>

        <span class="volume" @wheel.prevent="$store.commit('setVolume', parseInt(volume) + (Math.sign($event.deltaY) * -5))">
            <i class="fa fa-volume-up volume-icon"/>
            <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" step="1"
                   @input="$store.commit('setVolume', parseInt($event.target.value))">
            <input type="number" class="volume-box" id="volume-box" min="0" max="100"
                   @change="$store.commit('setVolume', parseInt($event.target.value))">
        </span>

    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState([
            'playlist_playing',
            'video_playing',
            'playing',
            'player'
        ]),
        ...mapState({
            random: state => state.settings.random,
            scroll_title: state => state.settings.scroll_title,
            volume: state => state.settings.volume
        })
    },
    watch: {
        scroll_title: function () {
            // TODO: Move this somewhere more fitting
            var text = this.video_playing == null ? 'MusicTube' : this.video_playing.title
            this.$store.dispatch('setWindowTitle', text)
        }
    }
}
</script>

<style lang="sass">
@import ../sass/colors

.controls
    display: flex
    flex-direction: row
    align-items: center
    padding: 0 30px 0 0
    font-size: 1.8em

.controls *
    padding: 0 10px

// fa-play and fa-pause have different widths, which would cause the entire navbar to shift by 2px
#play-button
    width: 25px

.grey
    color: $random-off

.track
    flex: 1
    display: flex
    margin-top: 2px

.thumb-nav img
    margin: 0
    border: 2px solid $wtext

.track-info
    flex: 1
    margin-left: 10px
    margin-top: 3px
    overflow: hidden
    width: 0
    text-overflow: ellipsis

.track-title,
.position-text
    margin: 0
    padding: 0
    white-space: nowrap

.position
    display: flex
    flex-flow: row
    white-space: nowrap

.position-slider
    margin: 12px 0 0 10px !important
    width: 150%

.volume
    padding: 25px 20px
    white-space: nowrap

.volume-box
    background-color: rgba(#000, 0)
    color: $wtext
    border: 0
    width: 45px
    border-bottom: 1px solid $wtext
    margin-right: 20px

.volume-icon
    padding: 0 5px

.volume-slider
    margin: 0 5px 3px 0 !important
    width: 60%

// Sliders. Code taken from https://codepen.io/seanstopnik/pen/CeLqA
$range-handle-color: $sliders
$range-handle-color-hover: $wtext
$range-handle-size: 15px

$range-track-color: $grey
$range-track-height: 3px

input[type=range]
  -webkit-appearance: none
  height: $range-track-height
  border-radius: 1px
  background: $range-track-color
  outline: none
  padding: 0
  margin: 0

  // Range Handle
  &::-webkit-slider-thumb
    appearance: none
    width: $range-handle-size
    height: $range-handle-size
    border-radius: 50%
    background: $range-handle-color
    cursor: pointer
    transition: background .15s ease-in-out

    &:hover
      background: $range-handle-color-hover

  &:active::-webkit-slider-thumb
    background: $range-handle-color-hover

  &::-moz-range-thumb
    width: $range-handle-size
    height: $range-handle-size
    border: 0
    border-radius: 50%
    background: $range-handle-color
    cursor: pointer
    transition: background .15s ease-in-out

    &:hover
      background: $range-handle-color-hover

  &:active::-moz-range-thumb
    background: $range-handle-color-hover

// Firefox Overrides
::-moz-range-track
    background: $range-track-color
    border: 0

input::-moz-focus-inner,
input::-moz-focus-outer
  border: 0

// Transition
.position-enter-active
    .position-slider
        transition: width 1.5s ease-in-out

.position-enter
    .position-slider
        width: 1px

</style>
