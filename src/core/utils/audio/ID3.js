import {TextDecoder} from 'text-encoding';

/**
 * Utility class for reading ID3 tags
 */
export default class ID3 {
    static HEADER_SIZE = 10;

    static ID3_ENCODINGS = [
        'ascii',
        'utf-16',
        'utf-16be',
        'utf-8'
    ];

    static LANG_FRAMES = [
        'USLT',
        'SYLT',
        'COMM',
        'USER'
    ];

    static decodeFrame(buffer, offset) {
        let header = new DataView(buffer, offset, this.HEADER_SIZE + 1);
        if (header.getUint8(0) === 0) {
            return;
        }

        let id = this.decode('ascii', new Uint8Array(buffer, offset, 4));

        let size = header.getUint32(4);
        let contentSize = size - 1;
        let encoding = header.getUint8(this.HEADER_SIZE);

        let contentOffset = offset + this.HEADER_SIZE + 1;

        let lang;
        if (this.LANG_FRAMES.includes(id)) {
            lang = this.decode('ascii', new Uint8Array(buffer, contentOffset, 3));
            contentOffset += 3;
            contentSize -= 3;
        }

        let value = this.decode(this.ID3_ENCODINGS[encoding],
            new Uint8Array(buffer, contentOffset, contentSize));

        return {
            id, value, lang,
            size: size + this.HEADER_SIZE
        };
    }

    static decode(format, string) {
        return new TextDecoder(format).decode(string)
    }

    static read(buffer) {
        let header = new DataView(buffer, 0, this.HEADER_SIZE);

        let size = this.syncToInt(header.getUint32(6));

        let offset = this.HEADER_SIZE;
        let id3Size = this.HEADER_SIZE + size;

        let data = [];
        while (offset < id3Size) {
            let frame = this.decodeFrame(buffer, offset);
            if (!frame) {
                break;
            }
            data.push(frame);
            // console.log(`${frame.id}: ${frame.value.length > 200 ? '...' : frame.value}`);
            offset += frame.size;
        }

        return data;
    }


    static syncToInt(sync) {
        const mask = 0b01111111;

        let b1 = sync & mask;
        let b2 = (sync >> 8) & mask;
        let b3 = (sync >> 16) & mask;
        let b4 = (sync >> 24) & mask;

        return b1 | (b2 << 7) | (b3 << 14) | (b4 << 21);
    }
}