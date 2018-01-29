<template>
<div class="player">
    <div class="controls">
        <p id="prev-button" @click="onPrevTrack">
            <i class="fa fa-backward"></i>
        </p>
        <p id="play-button" @click="onPlayPause">
            <i id="fa-play" class="fa" :class="{'fa-pause': playing, 'fa-play': !playing}"></i>
        </p>
        <p id="random-button" @click="random = !random" :class="{ 'grey': !random }">
            <i class="fa fa-random"></i>
        </p>
        <p id="next-button" @click="onNextTrack">
            <i class="fa fa-forward"></i>
        </p>
    </div>
    <div class="thumb-nav" v-if="cur_video !== null">
        <img :src="`https://i.ytimg.com/vi/${cur_video.url}/mqdefault.jpg`" height="50px">
    </div>
    <div class="track">
        <p class="track-title" id="track-title">{{ player.title }}</p>
        <transition name="position-fade">
            <span class="position" v-if="cur_video !== null">
                <p class="position-text">{{ formatSeconds(player.position) }} / {{ formatSeconds(cur_video.length) }}</p>
                <input type="range" class="position-slider" id="position-slider" min="0" :max="cur_video.length" step="cur_video.length / 100"
                    @input="player.e.currentTime = Math.floor($event.target.value)" :value="player.position">
            </span>
        </transition>
    </div>
    <span class="volume">
        <span class="volume-icon">
            <i class="fa fa-volume-up"></i>
        </span>
        <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" step="1" @input="volume = $event.target.value"
            :value="volume">
        <input type="number" class="volume-box" id="volume-box" min="0" max="100" @change="volume = $event.target.value" :value="volume">
    </span>
</div>
</template>

<script>
export default {
    props: ['cur_playlist', 'new_video', 'scroll_title'],
    data: function () {
        return {
            // State info
            cur_video: null,
            cur_video_index: 0,
            scroller_interval_id: 0,

            // --- Player/audio element ---
            player: {
                e: document.getElementById('player'),
                title: 'No track playing.',
                position: 0
            },
            playing: false,

            // --- User preferences ---
            random: false,
            volume: 25,
        }
    },
    mounted: function () {
        // Pause the player; add some event handlers to it
        this.player.e.pause();
        this.player.e.addEventListener('timeupdate', () => {
            this.player.position = Math.floor(this.player.e.currentTime);
        });
        this.player.e.addEventListener('ended', this.onNextTrack);
    },
    watch: {
        new_video: function (video) {
            // new_video is updated when videos component selects a new video
            if (video === this.cur_video) return;
            this.updateCurrentTrack(video);    
        },
        volume: function (vol) {
            // Setting volume in HTML tags is not possible, so v-bind isn't an option.
            this.player.e.volume = vol / 400;
        },
        cur_video_index: function (index) {
            if (this.cur_playlist.videos[index] === this.cur_video) {
                return;
            }
            if (this.random) {
                index = Math.floor((Math.random() * this.cur_playlist.videos.length) + 1);
            }
            if (index >= 0 && index < this.cur_playlist.videos.length) {
                this.updateCurrentTrack(this.cur_playlist.videos[index]);
            } else {
                this.cur_video_index = 0;
            }
        },
        scroll_title: function () {
            var text = this.cur_video == null ? 'MusicTube' : this.cur_video.title;
            this.setTitle(text);
        }
    },
    methods: {
        // --- Helper methods ---
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        }, 
        setTitle(text) {
            clearTimeout(this.scroller_interval_id);
            document.title = text;
            if (this.scroll_title && text !== 'MusicTube') {
                this.scroller_interval_id = setTimeout(() => {
                    this.setTitle(text.substr(1) + text.substr(0, 1));
                }, 500);
            }
        },

        // --- Playlist/Video playing related methods ---
        updateCurrentTrack: function (video) {
            console.log(this.player);
            this.player.e.pause();
            this.player.e.currentTime = 0;

            this.cur_video = video;
            this.cur_video_index = this.cur_playlist.videos.indexOf(this.cur_video);
            this.setTitle(video.title);
            this.player.title = 'Loading...';
            this.updateThumbnail(video);

            // 'this' is overridden, but we still need access to the component's data.
            var comp = this;
            this.$parent.sendRequest('GET', '/u/' + video.url, null, function () {
                if (this.readyState == 4 && this.status == 200) {
                    comp.player.title = video.title;
                    comp.player.e.setAttribute('src', this.responseText);
                    comp.player.e.play();
                    comp.playing = true;
                }
            });
        },
        // YouTube maxresdefault thumbnails sometimes aren't available, so we fallback to mqdefault.
        updateThumbnail(video) {
            var image = new Image();
            var that = this;
            image.onload = function () {
                if (('naturalHeight' in image && image.naturalHeight <= 90) || image.height <= 90) {
                    video.thumbnail = `https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`;
                } else {
                    video.thumbnail = `https://i.ytimg.com/vi/${video.url}/maxresdefault.jpg`;
                }
                that.$emit('update:thumbnail', video.thumbnail);
            };
            image.src = `https://i.ytimg.com/vi/${video.url}/maxresdefault.jpg`;
        },
        onPlayPause() {
            if (!this.playing && this.player.e.src !== '') {
                this.player.e.play();
            } else if (this.playing) {
                this.player.e.pause();
            }
            this.playing = !this.player.e.paused;
        },
        onPrevTrack() {
            if (this.playing) this.cur_video_index -= 1;
        },
        onNextTrack() {
            if (this.playing) this.cur_video_index += 1;
        },
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
    background-size: cover;
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


.volume
    padding: 0 20px 0 20%
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


</style>
