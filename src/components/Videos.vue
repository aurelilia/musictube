<template>
    <span class="no-avail" v-if="playlist_viewing == undefined">Playlist not found! Either it is private, or it does not exist.</span>
    <span class="no-avail" v-else-if="!playlist_viewing.videos.length">No videos. Go into editor mode to add one!</span>
    <table v-else>
        <tr v-for="video in playlist_viewing.videos" :key="video.id"
            @click="$store.commit('updateCurrentTrack', {video, playlist: playlist_viewing})">
            <td class="thumb"><img :src="`https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`" height="60px"></td>
            <td class="name">{{ video.title }}</td>
            <td class="context">{{ formatSeconds(video.length) }}</td>
            <td class="delete" v-if="editor_active"><i class="fa fa-trash-o" @click="$store.commit('deleteVideo', video)"/></td>
        </tr>
    </table>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'playlist_viewing',
        'editor_active'
    ])
}
</script>

<style lang="sass">
@import ../sass/colors

.thumb
    width: 65px

</style>
