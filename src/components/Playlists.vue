<template>
    <span class="no-avail" v-if="!playlists.length">No playlists. Go into editor mode to add one!</span>
    <table v-else>
        <tr v-for="playlist in playlists" :key="playlist.id" @click="$store.dispatch('navigate', playlist.id)">
            <td class="playlist-thumb" v-if="playlist.videos !== null">
                <img :src="`https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`" height="50px"
                     v-for="(video, index) in playlist.videos.slice(0, 3)"
                     :class="'thumb-' + (index + 1)" :key="index">
            </td>
            <td class="playlist-thumb" v-else />
            <td class="name">{{ playlist.name }}</td>
            <td class="context">{{ playlist.videos.length }} {{ (playlist.videos.length === 1) ? "title" : "titles" }}</td>
            <td class="rename" v-if="editor_active"><i class="fa fa-edit"
                @click.stop="$store.dispatch('editorRename', { type: 'playlist', listid: playlist.id})" /></td>
            <td class="delete" v-if="editor_active"><i class="fa fa-trash-o"
                @click.stop="$store.dispatch('editorDelete', { type: 'playlist', listid: playlist.id })" /></td>
        </tr>
    </table>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState([
        'playlists',
        'editor_active'
    ])
}
</script>

<style lang="sass">
@import ../sass/colors

.playlist-thumb
    position: relative
    min-width: 110px
    width: 110px
    height: 90px

.playlist-thumb img
    position: absolute
    border: 1px solid $wtext

@for $i from 1 through 3
    .thumb-#{$i}
        left: 10px * $i
        top: ($i * -10) + 40
        z-index: ($i * -10) + 40

</style>
