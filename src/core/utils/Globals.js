import Vue from "vue"

export default class Globals {
    /**
     * The global Vue instance
     *
     * @private
     * @type {Vue|null}
     */
    static VueInstance = null;

    /**
     * Set the Vue instance for the application
     *
     * @param {Vue} instance
     */
    static setVueInstance(instance) {
        this.VueInstance = instance;
    }

    /**
     * Get the Vue instance of the program
     *
     * @returns {Vue}
     */
    static getVueInstance() {
        return this.VueInstance;
    }
}