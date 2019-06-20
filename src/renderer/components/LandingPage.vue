<template>
    <div id="wrapper">
        <button class="button" @click="playSong">Select A Song</button>
        <button class="button" @click="resumeSong">Resume Song</button>
        <button class="button" @click="pauseSong">Pause Song</button>


        <h5>{{ getIsPlaying ? "Playing" : "Stopped" }}</h5>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    const {dialog} = require('electron').remote;

    export default {
        name: 'landing-page',
        computed: {
            ...mapGetters(['getIsPlaying'])
        },
        methods: {
            resumeSong() {
                this.$options.player.resume();
            },
            pauseSong() {
                this.$options.player.pause();
            },
            playSong() {
                dialog.showOpenDialog({
                    properties: ['openFile']
                }, (files) => {
                    if (files !== undefined) {
                        let musicFile = files.find(() => true);

                        this.$options.player.play(musicFile);
                    }


                })
            }
        },
        mounted() {
        }
    }
</script>

<style lang="scss">
    @import "~foundation-sites/scss/foundation";
</style>
