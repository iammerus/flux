import ID3 from "^/core/utils/audio/ID3";

export default class Song {
    fileName;

    trackNumber;
    /**
     * The title of the track
     *
     * @type {String}
     */
    title = null;

    trackTotal;
    album = null;
    /**
     * The album art of the track
     *
     * @type {ArrayBuffer}
     */
    albumArt = null;
    albumArtist = null;
    artist = null;
    genre = null;
    year = null;
    publisher = null;

    /**
     * Create a new instance of the song class
     *
     * @param {ArrayBuffer} songData
     * @param filename
     */
    constructor(songData, filename) {
        this.readTags(songData);
        this.fileName = filename;
    }

    readTags(buffer) {
        let tags = ID3.read(buffer);

        tags.forEach((t) => {
            switch (t.id) {
                case "TIT2":
                    this.title = t.value;
                    break;
                case "TPE1":
                    this.artist = t.value;
                    break;
                case "TPE2":
                    this.albumArtist = t.value;
                    break;
                case "TALB":
                    this.album = t.value;
                    break;
                case "TCON":
                    this.genre = t.value;
                    break;
                case "TYER":
                    this.year = t.value;
                    break;
                case "TPUB":
                    this.publisher = t.value;
                    break;
                case "TRCK":
                    this.trackTotal = t.value;
                    break;
                case "TPOS":
                    this.trackNumber = t.value;
                    break;

                case "APIC":
                    // TODO: Image needs to be saved somewhere then we can reference the file on disk instead.
                    //  Storing the actual image data in memory will swallow up memory when the library is big enough
                    //  Alternatively, album art can be read on the fly
                    this.albumArt = t.value;
                    break;
            }
        });

        tags = null;
    }
}