<template>
    <span class="no-avail" v-if="playlist_viewing == undefined">Playlist not found! Either it is private, or it does not exist.</span>
    <span class="no-avail" v-else-if="!playlist_viewing.videos.length">No videos. Go into editor mode to add one!</span>
    <table v-else>
        <tr v-for="video in playlist_viewing.videos" :key="video.id"
            @click="if (!editor_active) $store.commit('updateCurrentTrack', {video, playlist: playlist_viewing})">
            <td class="thumb"><img :src="`https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`" height="60px"></td>
            <td class="name">{{ video.title }}</td>
            <td class="context">{{ formatSeconds(video.length) }}</td>
            <td class="delete" v-if="editor_active" @click="$store.commit('deleteVideo', video)"><i class="fa fa-trash-o"/></td>
        </tr>
    </table>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'playlist_viewing',
        'playlist_playing',
        'video_playing',
        'editor_active'
    ]),
    watch: {
        video_playing (video) {
            if (this.playlist_playing !== this.playlist_viewing) return
            var e = document.getElementsByTagName('tr')[this.playlist_playing.videos.indexOf(video)]
            this.scrollIntoView(e)
        }
    },
    methods: {
        scrollIntoView (e) {
            // Following code block taken from https://stackoverflow.com/a/5354536
            var rect = e.getBoundingClientRect()
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
            var in_view = !(rect.bottom < 200 || rect.top - viewHeight >= -100)
            if (in_view) return

            var top = (rect.bottom < 200)
            var offset = top ? (e.offsetTop) : (e.offsetTop - (viewHeight - Math.floor(viewHeight * 0.3)))
            document.getElementById('wrapper').scrollTop = offset
        }
    }
}
</script>

<style lang="sass">
@import ../sass/colors

.thumb
    width: 65px

</style>
