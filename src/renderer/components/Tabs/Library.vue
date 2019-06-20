<template>
    <div class="library page">
        <button @click="playEntireLibrary">Play Library</button>
        <button @click="nextSong">Next Song</button>
        <button @click="previousSong">Previous Song</button>
        <section id="songs">
            <div class="song" v-for="song in songs">
                {{ song.title }} - {{ song.artist }}
                <button @click="play(song)">{{ currentPlayingSong === song && isPlaying ? "Pause" : "Play" }}</button>
            </div>
        </section>

        <progress-bar></progress-bar>
    </div>
</template>

<script>
    import ProgressBar from "@/components/Tabs/Partials/ProgressBar";

    export default {
        name: "Library",
        components: {ProgressBar},
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
            playEntireLibrary() {
                if (this.isPlaying) return;

                this.$player.playPlaylist();
            },
            nextSong() {
                this.$player.next();
            },
            previousSong() {
                this.$player.prev();
            },
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