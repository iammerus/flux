import fs from "mz/fs";
import {enforceFileExists} from "^/core/files/Helpers";
import {toArrayBuffer} from "^/core/utils/Buffers";

export default class Player {
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
     * Play
     */
    static async play(file) {
        // Make sure the file exists
        await enforceFileExists(file);

        // Open buffer to file
        let buffer = await fs.readFile(file);

        let context = this.getContext();

        let audioBuffer = await context.decodeAudioData(toArrayBuffer(buffer));

        const source = context.createBufferSource();

        source.buffer = audioBuffer;
        source.connect(context.destination);

        source.start();

        return new Promise((resolve, reject) => resolve(true))
    }
}