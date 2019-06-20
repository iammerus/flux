import DirectoryHelper from "^/core/files/DirectoryHelper";
import Song from "^/core/audio/types/Song";

export default class Library {
    MUSIC_FILE_EXTENSIONS = [
        '.mp3',
        '.wav'
    ];

    musicCollection = [];

    /**
     *
     * @param {StateWrapper} stateWrapper
     */
    constructor(stateWrapper) {
        this.stateWrapper = stateWrapper;
    }

    async readLibrary() {
        if (!this.stateWrapper.get('Library/getPreviouslyScanned')) {
            // noinspection JSIgnoredPromiseFromCall
            await this.scanTracks(this.stateWrapper.get("Library/getWatchedDirectories"));
        } else {
            this.musicCollection = this.stateWrapper.get('Library/getScannedTracks');
        }

        return this.musicCollection;
    }

    /**
     * Scan for music files in the given directories
     *
     * @param {Array} directories
     */
    async scanTracks(directories) {
        if (!directories || !Array.isArray(directories)) return;


        let tracks = [];

        for(let directory of directories) {
            let batch = await DirectoryHelper.walk(directory, this.MUSIC_FILE_EXTENSIONS);

            tracks = tracks.concat(batch);
        }

        await this.readSongs(tracks);
    }

    async readSongs(tracks) {
        let limit = 5;
        for (let track of tracks) {
            if (limit === 0) {
                break;
            }

            this.musicCollection.push(new Song(await DirectoryHelper.getFileArrayBuffer(track), track));

            limit--;
        }
    }

    getState() {
        return this.stateWrapper;
    }
}