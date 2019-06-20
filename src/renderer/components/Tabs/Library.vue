<template>
    <div class="library page">
        <section id="songs">
            <div class="song" v-for="song in songs">
                {{ song.title }} - {{ song.artist }}
                <button @click="play(song)">{{ currentPlayingSong === song && isPlaying ? "Pause" : "Play" }}</button>
            </div>
        </section>
    </div>
</template>

<script>
    export default {
        name: "Library",
        props: ['isPlaying', 'isStopped', 'isPaused', 'currentPlayingSong', 'genres', 'songs'],
        created() {
            this.$eventHub.$on('library.scan.complete', () => {
                this.$forceUpdate();
                // TODO: Fix reactivity problems with songs and genres computed properties so that this is unnecessary
            });
        },
        watch: {
            songs(value) {
                console.log("Value changed: ", value);
            }
        },
        methods: {
            play(song) {
                if (this.isPlaying && song === this.currentPlayingSong) {
                    console.log("Pausing");

                    return this.$player.pause();
                }

                console.log("Playing");
                this.$player.play(song);
            },
        },

    }
</script>

<style scoped>

</style>