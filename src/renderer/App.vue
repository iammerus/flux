<template>
  <div id="app">
    <router-view
            :currentPlayingSong="currentPlayingSong"
            :genres="genres"
            :isPaused="isPaused"
            :isPlaying="isPlaying"
            :isStopped="isStopped"
            :songs="songs"
    ></router-view>
  </div>
</template>

<script>
  export default {
    name: 'flux-player',
    data() {
      return {
        isPlaying: false,
        isPaused: false,
        isStopped: true,
        currentPlayingSong: null,
        lastScan: Date.now()
      }
    },
    computed: {
      songs() {
        this.lastScan;

        return this.$library.musicCollection;
      },

      genres() {
        this.lastScan;

        let genres = {};

        for (let song of this.$library.musicCollection) {
          let genre = song.genre || "Unknown Genre";

          if (!genres[genre]) genres[genre] = [];

          genres[genre].push(song);
        }

        return genres;
      }
    },
    created() {
      this.$eventHub.$on('player.state.changed', (state = 'stopped', song = null) => {
        console.log("Play state has changed");

        this.currentPlayingSong = song;

        this.isPlaying = state === 'playing';
        this.isPaused = state === 'paused';
        this.isStopped = state === 'stopped';
      });


      this.$eventHub.$emit('library.scan.started');
      this.$library.readLibrary().then(() => {
        console.log("Library scan (limited) complete");
        this.lastScan = Date.now();

        this.$eventHub.$emit('library.scan.complete');
      });
    }
  }
</script>

<style>
  /* CSS */
</style>
