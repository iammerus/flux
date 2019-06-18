import fs from "mz/fs";
import {toArrayBuffer} from "^/core/utils/Buffers";
import {enforceFileExists} from "^/core/files/Helpers";

export default class Player {
    /**
     * The buffer source for the song currently being played
     *
     * @type {AudioBufferSourceNode|null}
     */
    static currentBufferSource = null;

    static lastPlayTime = null;

    static currentNativeBuffer = null;

    static currentAudioBuffer = null;

    /**
     * Audio Context
     * @type {AudioContext|null}
     * @private
     */
    static _context = null;

    /**
     * Get an instance of the AudioContext class
     *
     * @private
     * @returns {AudioContext}
     */
    static getContext() {
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
    static async play(file) {
        // Make sure the file exists
        await enforceFileExists(file);

        this.currentNativeBuffer = await fs.readFile(file);

        let context = this.getContext();

        this.currentAudioBuffer = await context.decodeAudioData(toArrayBuffer(this.currentNativeBuffer));

        this.createNewAudioBufferSourceNode();

        this.currentBufferSource.start();
    }

    static resume() {
        if (!this.currentBufferSource || !this.lastPlayTime) return;

        this.createNewAudioBufferSourceNode();

        console.log(this.lastPlayTime);

        this.currentBufferSource.start(this.lastPlayTime);
    }

    static pause() {
        if (!this.currentBufferSource) return;

        this.currentBufferSource.stop();

        this.lastPlayTime = this.getContext().currentTime;
    }

    static async createNewAudioBufferSourceNode() {
        this.currentBufferSource = this.getContext().createBufferSource();

        this.currentBufferSource.buffer = this.currentAudioBuffer;
        this.currentBufferSource.connect(this.getContext().destination);
    }
}