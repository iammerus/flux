import ID3 from "^/core/utils/audio/ID3";

export default class Song {
    /**
     * Create a new instance of the song class
     *
     * @param {ArrayBuffer} songData
     */
    constructor(songData) {
        Song.readTags(songData);
    }

    trackNumber;

    trackTotal;

    /**
     * The title of the track
     *
     * @type {String}
     */
    title;


    album;

    /**
     * The album art of the track
     *
     * @type {ArrayBuffer}
     */
    albumArt;


    albumArtist;

    genre;

    year;

    publisher;

    static readTags(buffer) {
        console.log(ID3.read(buffer));
    }
}