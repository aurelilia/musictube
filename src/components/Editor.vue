<template>
    <div class="navbar-content">
        <div class="controls">
            <p class="add-icon">
                <i class="fa fa-plus" @click="add = !add"></i>
            </p>
            <form @submit.prevent="onAdd()">
                <input type="text" class="add-input" id="add-input" v-if="add" placeholder="Enter name/URL..."/>
            </form>
        </div>
        <span class="exit" @click="$store.commit('toggleEditor')">
            Return to player
        </span>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: mapState([
        'screen',
        'playlists',
        'playlist_viewing'
    ]),
    data: function () {
        return {
            add: false
        }
    },
    methods: {
        onAdd() {
            var input = document.getElementById('add-input').value;
            if (input === '') {
                alert('Please enter a name.');
                return;
            }

            switch (this.screen) {
            case 'playlists':
                var playlists = this.playlists;

                if (input.includes('youtube.com/playlist')) {
                    var content = {
                        url: input,
                        private: false
                    };
                    var that = this;
                    this.sendRequest('POST', '/e/ip/', JSON.stringify(content), () => {
                        if (this.readyState == 4 && this.status == 200) {
                            that.$store.commit('setPlaylists', JSON.parse(this.responseText));
                        }
                    });
                } else {
                    for (var i = 0, len = this.playlists.length; i < len; i++) {
                        if (input === this.playlists[i].name) {
                            alert('You already have a playlist with that name! Please choose another one.');
                            return;
                        }
                    }
                    var new_playlist = {
                        name: input,
                        private: false,
                        videos: []
                    };
                    playlists.push(new_playlist);
                    this.$store.commit('setPlaylists', playlists);
                    this.sendRequest('POST', '/e/np/', JSON.stringify(new_playlist));
                }
                break;
            case 'videos':
                var playlist = this.playlist_viewing;
                if (!input.includes('youtube.com/watch?v=')) {
                    alert('Not a valid URL! Please try again.');
                    return;
                }

                var new_video = {
                    url: input,
                    plistname: playlist.name
                };
                var that = this;
                this.sendRequest('POST', '/e/nv/', JSON.stringify(new_video), () => {
                    if (this.readyState == 4 && this.status == 200) {
                        that.$store.commit('update:playlist_viewing', JSON.parse(this.responseText));
                    }
                });
                break;
            }
            this.add = false;
            document.getElementById('add-input').value = '';
        },
    }
}

</script>

<style lang="sass">
@import ../sass/colors

.add-icon
    font-size: 1.3em
    flex: 1

input[type=text]
    border: 0
    border-bottom: 2px solid $wtext
    background-color: rgba(#000, 0)
    color: $wtext
    margin: 20px
    margin-bottom: 0
    font-size: .6em
    font-family: 'Open Sans', sans-serif
    text-align: center

.exit
    margin: 0 10px
    flex: 1
    text-align: right
    
</style>
