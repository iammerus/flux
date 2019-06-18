import fs from "mz/fs";

/**
 * Validates that a file exists. If the file does not exist then it will throw an exception
 *
 * @param {String} file The full path to the file
 *
 * @return void
 */
export async function fileExists(file) {
    return await fs.exists(file);
}

/**
 * Validates that a file exists. If the file does not exist then it will throw an exception
 *
 * @param {String} file The full path to the file
 *
 * @return void
 */
export async function enforceFileExists(file) {
    if (!await fileExists(file)) {
        throw new Error("The specified file does not exist ")
    }

    return new Promise((resolve, reject) => resolve(true))
}