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

    currentAudioBuffer = null;

    isPaused = false;

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
    async play(song) {
        if(this.isPaused) {
            return this.resume();
        }

        if (this.isPlaying) {
            this.stop();
        }

        // Make sure the file exists
        await enforceFileExists(song.fileName);

        this.currentSong = song;
        this.currentNativeBuffer = await fs.readFile(song.fileName);

        let context = this.getContext();

        let arrayBuffer = toArrayBuffer(this.currentNativeBuffer);

        this.currentAudioBuffer = await context.decodeAudioData(arrayBuffer);

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start();

        this.isPlaying = true;
        this.stateWrapper.mutate('setIsPlaying');

        emitEvent('player.state.changed', 'playing', this.currentSong);
    }

    stop() {
        if (!this.currentBufferSource) return;

        this.currentBufferSource.stop();

        this.isPaused = false;

        emitEvent('player.state.changed', 'stopped', this.currentSong);
    }

    resume() {
        if (!this.currentBufferSource || !this.lastPlayTime) return;

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start(this.lastPlayTime, this.lastPlayTime);
        this.isPaused = false;

        emitEvent('player.state.changed', 'playing', this.currentSong);
    }

    pause() {
        if (!this.currentBufferSource) return;

        this.currentBufferSource.stop();

        let context = this.getContext();

        this.lastPlayTime = context.currentTime;

        this.isPaused = true;
        emitEvent('player.state.changed', 'paused', this.currentSong);

    }

    createNewAudioBufferSourceNode() {
        let context = this.getContext();

        this.currentBufferSource = context.createBufferSource();

        this.currentBufferSource.buffer = this.currentAudioBuffer;

        this.currentBufferSource.connect(context.destination);
    }
}