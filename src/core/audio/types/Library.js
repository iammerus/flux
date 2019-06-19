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
        if (!stateWrapper.get('Library/getPreviouslyScanned')) {
            this.scanTracks(stateWrapper.get("Library/getWatchedDirectories"));
        } else {
            this.musicCollection = stateWrapper.get('Library/getScannedTracks');
        }
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

        this.readSongs(tracks);
    }

    async readSongs(tracks) {
        // this.state
        for (let track of tracks) {
            this.musicCollection.push(new Song(await DirectoryHelper.getFileArrayBuffer(track)))
        }
    }
}