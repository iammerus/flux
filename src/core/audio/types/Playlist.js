/**
 * This class represents a single playlist in memory
 *
 * TODO: We'll need to come up with a way to name playlists and persist them. That way users can create and save
 *  their own playlists
 */
export class Playlist {

    /**
     * The name of the playlist, this is what is shown to the user
     *
     * @type {String}
     */
    name;

    /**
     * Collection of the songs in the playlist
     *
     * @type {Array}
     */
    songs;

    /**
     * Date when the playlist was created
     *
     * @type {Date}
     */
    createdDate;

    /**
     * Create an instance of the playlist class
     *
     * @param {Array} songs The songs to be added to the playlist
     * @param {Song} current The song to set as the current song in the playlist
     */
    constructor(songs, current = null) {
        this.songs = songs;

        this.currentSong = current;
    }

    /**
     * Sets the current song in the playlist
     *
     * @param {Song} song The song to set as the current song
     *
     * @return {Number} The position of the current song
     */
    setCurrent(song) {
        let position = this.songs.indexOf(song);

        if (position < 0) {
            throw new Error("Specified song does not exist in the current playlist");
        }

        this.currentSong = song;
    }

    /**
     * Get the previous song in the playlist
     *
     * @returns {Song|null}
     */
    previousSong() {
        if (this.isAtFirstSong()) return null;

        this.currentSong = this.songs[this.getCurrentSongPosition() + 1];

        return this.currentSong;
    }

    /**
     * Get the next song in the playlist
     *
     * @returns {Song|null}
     */
    nextSong() {
        if (this.isAtLastSong()) return null;

        this.currentSong = this.songs[this.getCurrentSongPosition() + 1];

        return this.currentSong;
    }

    /**
     * Gets a boolean value indicating whether we're playing the last song in the playlist
     *
     * @returns {boolean}
     */
    isAtLastSong() {
        return this.songs.length - 1 === this.getCurrentSongPosition();
    }

    /**
     * Gets a boolean value indicating whether we're playing the first song in the playlist
     *
     * @returns {boolean}
     */
    isAtFirstSong() {
        return this.getCurrentSongPosition() === 0;
    }

    /**
     * Gets the current song in the playlist array
     *
     * @returns {Song}
     */
    getCurrentSong() {
        if (!this.currentSong) {
            this.currentSong = this.songs[0];
        }
        return this.currentSong;
    }

    /**
     * Gets the position of the current song in the playlist array
     *
     * @returns {Number}
     */
    getCurrentSongPosition() {
        if (!this.currentSong) {
            this.currentSong = this.songs[0];
        }
        return this.songs.indexOf(this.currentSong);
    }
}