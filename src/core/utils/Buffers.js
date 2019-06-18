/**
 * Convert a Node buffer to an ArrayBuffer
 *
 * @param {Buffer} buffer
 *
 * @link https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/31394257
 * @returns {ArrayBuffer}
 */
export function toArrayBuffer(buffer) {
    let arrayBuffer = new ArrayBuffer(buffer.length);
    let view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}