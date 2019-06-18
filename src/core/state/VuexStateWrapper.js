import Globals from "^/core/utils/Globals"

// TODO: Create an interface from which all state wrappers inherit from
//  so that we can easily switch state wrappers if we choose to change our
//  state management system. Implement.js?

/**
 * This class acts as a wrapper around Vuex.
 *
 * This is so our business logic doesn't depend on Vuex directly. What what what
 */
export default class VuexStateWrapper {
    constructor() {
        this.$vue = Globals.getVueInstance();

        console.log(this.$vue);
    }

    get(accessor) {
        if (!this.$vue.$store.getters.hasOwnProperty(accessor)) return null;

        return this.$vue.$store.getters[accessor];
    }

    mutate(mutation, payload) {
        this.$vue.$store.commit(mutation, payload);
    }
}