<template>   
<span v-if="!playlists.length">No playlists. Go into editor mode to add one!</span>
<table v-else>
    <tr v-for="playlist in playlists" :key="playlist.id">
        <td class="playlist-thumb" v-if="playlist.videos !== null">
            <img :src="`https://i.ytimg.com/vi/${video.url}/mqdefault.jpg`" height="50px" v-for="(video, index) in playlist.videos.slice(0, 3)" :class="'thumb-' + (index + 1)" :key="index"></img>
        </td>
        <td class="playlist-thumb" v-else></td>
        <td class="name" @click="$emit('update:view', playlist)">{{ playlist.name }}</td>
        <td class="context" @click="$emit('update:view', playlist)">{{ playlist.videos.length }} {{ (playlist.videos.length === 1) ? "title":"titles" }}</td>
        <td class="rename" v-if="editor"><i class="fa fa-edit" @click="onRename(playlist)"></i></td>
        <td class="delete" v-if="editor"><i class="fa fa-trash-o" @click="onDelete(playlist)"></i></td>
    </tr>
</table>
</template>

<script>
export default {
    props: ['playlists', 'editor'],
    methods: {
        onDelete(obj) {
            if (confirm('Are you sure you want to delete the playlist?')) {
                var vm = this.$parent;
                this.sendRequest('POST', '/e/dp/', obj.name);
                vm.playlists.splice(vm.playlists.indexOf(obj), 1);
            }
        },
        onRename(obj) {
            var list_name = prompt('Enter a new name for the playlist:');
            if (list_name !== null && list_name !== '') {
                this.sendRequest('POST', '/e/rp/', JSON.stringify({
                    'old': obj.name,
                    'new': list_name
                }));
                obj.name = list_name;
            }
        }
    }
 
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
