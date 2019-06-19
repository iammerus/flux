import fs from "mz/fs";
import {toArrayBuffer} from "^/core/utils/Buffers";
const path = require('path');


export default class DirectoryHelper {
    static async getFileArrayBuffer(filepath) {
        let nativeBuffer = await fs.readFile(filepath);

        return toArrayBuffer(nativeBuffer);
    }

    static async walk(dir, ext = null, fileList = []) {
        const files = await fs.readdir(dir);

        for (const file of files) {
            const stat = await fs.stat(path.join(dir, file));
            if (stat.isDirectory()) fileList = await this.walk(path.join(dir, file), ext, fileList);
            else {
                if (ext === null || await this.fileHasAnyExtension(file, ext)) {
                    fileList.push(path.join(dir, file));
                }
            }
        }
        return fileList
    }

    /**
     * Check if a file matches any of the given file extensions
     *
     * @param {String} file
     * @param {Array} extensions
     * @returns {Boolean}
     */
    static async fileHasAnyExtension(file, extensions) {
        let extension = path.extname(file);

        let matches = extensions.filter(i => typeof i === "string" && i.toLowerCase() === extension.toLowerCase());

        return matches.length > 0;
    }
}