import fs from "mz/fs";
import {toArrayBuffer} from "^/core/utils/Buffers";
import {enforceFileExists} from "^/core/files/Helpers";
import Song from "^/core/audio/types/Song";
import {emitEvent} from "^/core/state/EventHelper";

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

    currentSong;

    /**
     * Represents the user's music library in memory
     *
     * @type {Library}
     */
    library;
    isPlaying = false;

    /**
     * The buffer source for the song currently being played
     *
     * @type {AudioBufferSourceNode|null}
     */
    currentBufferSource = null;

    lastPlayTime = null;

    currentNativeBuffer = null;

    /**
     *
     * @type {AudioBuffer}
     */
    currentAudioBuffer = null;

    isPaused = false;

    _startTimestamp = 0; // timestamp of last playback start, milliseconds
    _isPlaying = false;
    _bufferDuration = 0; // seconds

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
     * Play the specified file
     *
     * @param {Song} song The full path to the file to play
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

        this._startTimestamp = Date.now();

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
        this.lastPlayTime = pausing ? (Date.now() - this._startTimestamp) / 1000 + this.lastPlayTime : 0;

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
    }

    onPlaybackEnded() {
        this.onStopped();
    }

    initOnProgressChanged() {
        this.progressHandle = setInterval(() => {
            emitEvent('player.track.progress.changed', this.getContext().currentTime, this.currentAudioBuffer.duration);
        }, 1000)
    }
}