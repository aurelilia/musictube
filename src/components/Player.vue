<template>
    <div class="player">

        <div class="controls">
            <p id="prev-button" @click="onPrevTrack">
                <i class="fa fa-backward"></i>
            </p>
            <p id="play-button" @click="onPlayPause">
                <i id="fa-play" class="fa" :class="{'fa-pause': playing, 'fa-play': !playing}"></i>
            </p>
            <p id="random-button" @click="$store.commit('toggleRandom')" :class="{ 'grey': !random }">
                <i class="fa fa-random"></i>
            </p>
            <p id="next-button" @click="onNextTrack">
                <i class="fa fa-forward"></i>
            </p>
        </div>

        <div class="thumb-nav" v-if="video_playing !== null">
            <img :src="`https://i.ytimg.com/vi/${video_playing.url}/mqdefault.jpg`" height="50px">
        </div>

        <div class="track">
            <p class="track-title" id="track-title">{{ player.title }}</p>
            <transition name="position-fade">
                <span class="position" v-if="video_playing !== null">
                    <p class="position-text">{{ formatSeconds(player.position) }} / {{ formatSeconds(video_playing.length) }}</p>
                    <input type="range" class="position-slider" id="position-slider" min="0" :max="video_playing.length" step="video_playing.length / 100"
                        @input="player.e.currentTime = Math.floor($event.target.value)" :value="player.position">
                </span>
            </transition>
        </div>

        <span class="volume">
            <span class="volume-icon">
                <i class="fa fa-volume-up"></i>
            </span>
            <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" step="1" @input="$store.commit('setVolume', $event.target.value)"
                :value="volume">
            <input type="number" class="volume-box" id="volume-box" min="0" max="100" @change="$store.commit('setVolume', $event.target.value)" :value="volume">
        </span>

        <audio id="player" autoplay></audio>

    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: Object.assign({
        video_id () {
            return this.playlist_playing.videos.indexOf(this.video_playing)
        }
    },
    mapState([
        'playlist_playing',
        'video_playing',
        'playing',
        'scroll_title',
        'random',
        'volume'
    ])
    ),
    data: function () {
        return {
            scroller_interval_id: 0,
            player: {
                e: null,
                title: 'No track playing.',
                position: 0
            }
        }
    },
    mounted: function () {
        // Pause the player add some event handlers to it
        this.player.e = document.getElementById('player')
        this.player.e.pause()
        this.player.e.addEventListener('timeupdate', () => {
            this.player.position = Math.floor(this.player.e.currentTime)
        })
        this.player.e.addEventListener('ended', this.onNextTrack)
        this.player.e.volume = this.volume / 400
    },
    watch: {
        video_playing: function (video) {
            this.updateCurrentTrack(video)
        },
        playing: function (playing) {
            playing ? this.player.e.play() : this.player.e.pause()
        },
        volume: function (vol) {
            // Setting volume in HTML tags is not possible, so v-bind isn't an option.
            this.player.e.volume = vol / 400
        },
        scroll_title: function () {
            var text = this.video_playing == null ? 'MusicTube' : this.video_playing.title
            this.setTitle(text)
        }
    },
    methods: {
        // --- Helper methods ---
        setTitle (text) {
            clearTimeout(this.scroller_interval_id)
            document.title = text
            if (this.scroll_title && text !== 'MusicTube') {
                this.scroller_interval_id = setTimeout(() => {
                    this.setTitle(text.substr(1) + text.substr(0, 1))
                }, 500)
            }
        },

        // --- Playlist/Video playing related methods ---
        updateCurrentTrack: function (video) {
            this.$store.commit('togglePlaying', false)
            this.player.e.currentTime = 0

            this.setTitle(video.title)
            this.player.title = 'Loading...'
            this.updateThumbnail(video)

            // 'this' is overridden, but we still need access to the component's data.
            var comp = this
            this.sendRequest('GET', '/u/' + video.url, null, function () {
                if (this.readyState === 4 && this.status === 200) {
                    comp.player.title = video.title
                    comp.player.e.setAttribute('src', this.responseText)
                    comp.$store.commit('togglePlaying', true)
                }
            })
        },
        // YouTube maxresdefault thumbnails sometimes aren't available, so we fallback to mqdefault.
        updateThumbnail (video) {
            var image = new Image()
            var that = this
            image.onload = function () {
                if (('naturalHeight' in image && image.naturalHeight <= 90) || image.height <= 90) {
                    video.thumbnail = `https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`
                } else {
                    video.thumbnail = `https://i.ytimg.com/vi/${video.url}/maxresdefault.jpg`
                }
                that.$store.commit('setThumbnail', video.thumbnail)
            }
            image.src = `https://i.ytimg.com/vi/${video.url}/maxresdefault.jpg`
        },
        onPlayPause () {
            if (this.player.e.src === '') return
            this.$store.commit('togglePlaying')
        },
        onPrevTrack () {
            if (this.video_playing != null) this.$store.commit('updateCurrentTrackByIndex', this.playlist_playing.videos.indexOf(this.video_playing) - 1)
        },
        onNextTrack () {
            if (this.video_playing != null) this.$store.commit('updateCurrentTrackByIndex', this.playlist_playing.videos.indexOf(this.video_playing) + 1)
        }
    }
}
</script>

<style lang="sass">
@import ../sass/colors

.bg-img
    position: fixed
    top: -1%
    left: -1%
    right: 0
    z-index: -1

    display: block
    background-size: cover
    width: 102%
    height: 102%

    filter: blur(7px)

.navbar-content
    flex: 1
    display: flex
    align-items: center

.controls
    display: flex
    flex-direction: row
    align-items: center
    padding: 0 30px 0 0
    font-size: 1.8em

.controls *
    padding: 0 5px

.grey
    color: $random-off

.track
    flex: 1

.thumb-nav img
    margin-right: 10px
    margin-top: 3px
    border: 2px solid $wtext

.track-title,
.position-text
    margin: 0
    padding: 0

.position
    display: flex
    flex-flow: row
    white-space: nowrap

.position-slider
    margin: 12px 0 0 10px !important
    width: 150%

.volume
    padding: 0 20px
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

</style>
