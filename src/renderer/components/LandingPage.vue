<template>
    <div id="wrapper">
        <button class="button" @click="playSong">Select A Song</button>
        <button class="button" @click="resumeSong">Resume Song</button>
        <button class="button" @click="pauseSong">Pause Song</button>


        <h5>{{ getIsPlaying ? "Playing" : "Stopped" }}</h5>
    </div>
</template>

<script>
    import Player from "^/core/audio/Player";
    import {mapGetters, mapActions} from 'vuex'
    import VuexStateWrapper from "^/core/state/VuexStateWrapper";

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
            this.$options.player = new Player(new VuexStateWrapper());
        }
    }
</script>

<style lang="scss">
    @import "~foundation-sites/scss/foundation";
</style>
