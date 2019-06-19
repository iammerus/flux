import fs from "mz/fs";
import {toArrayBuffer} from "^/core/utils/Buffers";
import {enforceFileExists} from "^/core/files/Helpers";
import Song from "^/core/audio/types/Song";


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

    constructor(stateWrapper) {
        this.stateWrapper = stateWrapper;
    }

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
     * @param {String} file The full path to the file to play
     *
     * @returns {Promise<void>|void}
     */
    async play(file) {
        if(this.isPaused) {
            return this.resume();
        }

        // Make sure the file exists
        await enforceFileExists(file);

        this.currentNativeBuffer = await fs.readFile(file);

        let context = this.getContext();

        let arrayBuffer = toArrayBuffer(this.currentNativeBuffer);

        let song = new Song(arrayBuffer);

        this.currentAudioBuffer = await context.decodeAudioData(arrayBuffer);

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start();

        this.stateWrapper.mutate('setIsPlaying')
    }

    resume() {
        if (!this.currentBufferSource || !this.lastPlayTime) return;

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start(this.lastPlayTime, this.lastPlayTime);
        this.isPaused = false;
    }

    pause() {
        if (!this.currentBufferSource) return;

        this.currentBufferSource.stop();

        let context = this.getContext();

        this.lastPlayTime = context.currentTime;

        this.isPaused = true;
    }

    createNewAudioBufferSourceNode() {
        let context = this.getContext();

        this.currentBufferSource = context.createBufferSource();

        this.currentBufferSource.buffer = this.currentAudioBuffer;

        this.currentBufferSource.connect(context.destination);
    }
}