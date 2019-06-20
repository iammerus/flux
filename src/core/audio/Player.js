import fs from "mz/fs";
import Song from "^/core/audio/types/Song";
import {toArrayBuffer} from "^/core/utils/Buffers";
import {emitEvent} from "^/core/state/EventHelper";
import {Playlist} from "^/core/audio/types/Playlist";
import {enforceFileExists} from "^/core/files/Helpers";

/**
 * The player class, assumes that despite which state management system is being used,
 * the following mutations exist
 *
 * 1. setIsPlaying
 * 2. setIsStoppedPlaying
 * 3. setLastPlayedSong
 *
 * Additionally, it assumes that the following getters also exist on the state
 *
 * 1. getIsPlaying
 * 2. getLastPlayedSong
 */
export default class Player {

    /**
     * Wrapper class around our current state management system
     *
     * @type {StateWrapper}
     */
    stateWrapper;

    /**
     * Represents the current song in the playlist
     *
     * @type {Song}
     */
    currentSong;

    /**
     * The currently played playlist
     *
     * @type {Playlist}
     */
    currentPlaylist;

    /**
     * Represents the user's music library in memory
     *
     * @type {Library}
     */
    library;

    /**
     * A boolean value indicating whether a song is being played or not
     *
     * @type {Boolean}
     */
    isPlaying = false;

    /**
     * The buffer source for the song currently being played
     *
     * @type {AudioBufferSourceNode|null}
     */
    currentBufferSource = null;

    /**
     * The position at which the song was at when playback was stopped
     *
     * @note This is used when pausing and resuming to keep track of where the user was in the song
     *
     * @type {Number|null}
     */
    lastPlayTime = null;

    /**
     * The buffer for the current song that's being played
     *
     * @type {Buffer}
     */
    currentNativeBuffer = null;

    /**
     * Audio buffer for the current track
     *
     * @type {AudioBuffer}
     */
    currentAudioBuffer = null;

    /**
     * Boolean value indicating whether a song is currently paused in the player. This is used internally by the player
     * class and does not have any bearings to the UI
     *
     * @type {Boolean}
     */
    isPaused = false;

    /**
     * The timestamp of the last playback
     *
     * @type {Number}
     */
    startTimestamp = 0;

    /**
     *
     * @param {Library} library
     */
    constructor(library) {
        this.stateWrapper = library.getState();
        this.library = library;
    }

    /**
     * Audio Context
     * @type {AudioContext|null}
     * @private
     */
    _context = null;

    /**
     * Get an instance of the AudioContext class
     *
     * @private
     * @returns {AudioContext}
     */
    getContext() {
        if (this._context === null) {
            this._context = new AudioContext();
        }

        return this._context;
    }

    /**
     * Play the given playlist or find a playlist with the specified identifier and play it
     * Additionally, if specified, play starting from the specified song
     *
     * @param {String|Playlist} playlist Unique identifier of the playlist to play, or an instance of the playlist class
     * @param {Song|null} song The song to start playing at
     */
    playPlaylist(playlist, song) {
        if (!playlist) {
            this.currentPlaylist = new Playlist(this.library.musicCollection, song);

            this.play(this.currentPlaylist.getCurrentSong());
        }
    }

    prev() {
        if (!this.currentPlaylist || this.currentPlaylist.isAtFirstSong()) return;

        this.play(this.currentPlaylist.previousSong());
    }

    /**
     * Move to the next song in the playlist.
     * @note This only applies to playlists. If playing single songs calling this method will not do anything
     *
     * @return void
     */
    next() {
        if (!this.currentPlaylist || this.currentPlaylist.isAtLastSong()) return;

        this.play(this.currentPlaylist.nextSong());
    }

    /**
     * Play the specified file
     *
     * @param {Song} song The full path to the file to play
     *
     * @param {Boolean} seeking Boolean value indicating whether we are seeking or not
     *
     * @returns {Promise<void>|void}
     */
    async play(song, seeking = false) {
        if (this.isPaused) {
            return this.resume();
        }

        if (this.isPlaying && !seeking) {
            this.stop();
        }

        let isReusing = false;
        if ((!song && this.currentSong) || seeking) {
            isReusing = true;
            song = this.currentSong;
        }

        let context = this.getContext();

        if (!isReusing) {
            // Make sure the file exists
            await enforceFileExists(song.fileName);

            this.currentSong = song;
            this.currentNativeBuffer = await fs.readFile(song.fileName);

            let arrayBuffer = toArrayBuffer(this.currentNativeBuffer);

            this.currentAudioBuffer = await context.decodeAudioData(arrayBuffer);
        }

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start(this.lastPlayTime, this.lastPlayTime);
        this.initOnProgressChanged();

        this.startTimestamp = Date.now();
        this.startedAt = context.currentTime;

        this.isPlaying = true;
        this.stateWrapper.mutate('setIsPlaying');

        emitEvent('player.state.changed', 'playing', this.currentSong);
    }

    stop(pausing, seeking) {
        if (!this.isPlaying) return;
        this.currentBufferSource.stop(0);

        if(seeking) return;

        this.isPlaying = false; // Set to flag to endOfPlayback callback that this was set manually

        // If paused, calculate time where we stopped. Otherwise go back to beginning of playback (0).
        this.lastPlayTime = pausing ? (Date.now() - this.startTimestamp) / 1000 + this.lastPlayTime : 0;

        if (!pausing) {
            emitEvent('player.state.changed', 'stopped', this.currentSong);
        }

        return true;
    }

    resume() {
        if (!this.currentBufferSource || !this.lastPlayTime) return;

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start(this.lastPlayTime, this.lastPlayTime);

        this.initOnProgressChanged();

        this.isPaused = false;
        this.isPlaying = true;


        emitEvent('player.state.changed', 'playing', this.currentSong);
    }

    pause() {
        if (this.stop(true)) {
            this.isPaused = true;
            this.isPlaying = false;

            emitEvent('player.state.changed', 'paused', this.currentSong);
        }
    }

    createNewAudioBufferSourceNode() {
        let context = this.getContext();

        this.currentBufferSource = context.createBufferSource();

        this.currentBufferSource.buffer = this.currentAudioBuffer;

        this.currentBufferSource.connect(context.destination);

        this.currentBufferSource.onended = () => this.onPlaybackEnded();
    }

    // Seek to a specific playbackTime (seconds) in the audio buffer. Do not change
    // playback state.
    seek(playbackTime) {
        if (!playbackTime) return;

        if (playbackTime > this.currentAudioBuffer.duration) {
            return;
        }

        if (this.isPlaying) {
            this.stop(false, true); // Stop any existing playback if there is any
            this.lastPlayTime = playbackTime;
            this.play(null, true); // Resume playback at new time
        } else {
            this.lastPlayTime = playbackTime;
        }
    }

    onStopped() {
        // this.isPlaying = false;
        clearInterval(this.progressHandle);
        emitEvent('player.state.changed', 'ended', this.currentSong);
    }

    onPlaybackEnded() {
        this.onStopped();

        if (this.currentPlaylist && !this.currentPlaylist.isAtLastSong()) {
            this.next();
        }
    }

    initOnProgressChanged() {
        this.progressHandle = setInterval(() => {
            emitEvent(
                'player.track.progress.changed',

                this.getContext().currentTime - this.startedAt, this.currentAudioBuffer.duration)
            ;
        }, 500)
    }
}