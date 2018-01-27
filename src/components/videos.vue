<template>
<span v-if="cur_playlist_view == undefined">Playlist not found! Either it is private, or it does not exist.</span>
<span v-else-if="!cur_playlist_view.videos.length">No videos. Go into editor mode to add one!</span>
<table v-else>
    <tr v-for="video in cur_playlist_view.videos" :key="video.id"
        @click="$emit('update:track', [cur_playlist_view, video])">
        <td class="thumb"><img :src="`https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`" height=60px></img></td>
        <td class="name">{{ video.title }}</td>
        <td class="context">{{ formatSeconds(video.length) }}</td>
        <td class="delete" v-if="editor"><i class="fa fa-trash-o" @click="onDelete(video)"></i></td>
    </tr>
</table>
</template>

<script>
export default {
    props: ['playlists', 'cur_playlist_view', 'editor'],
    methods: {
        formatSeconds(secs) {
            return new Date(1000 * secs).toISOString().substr(14, 5);
        },
        onDelete(obj) {
            if (confirm('Are you sure you want to remove the video?')) {
                var vm = this.$parent;
                vm.sendRequest('POST', '/e/dv/', JSON.stringify([vm.cur_playlist_view.name, obj.title]));
                vm.cur_playlist_view.videos.splice(vm.cur_playlist_view.videos.indexOf(obj), 1);
            }
        }
    }
}
</script>


