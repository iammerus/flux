const { app } = require('electron').remote;

const state = {
    watchedDirectories: [
        app.getPath('music')
    ],
    playlists: [],
    previouslyScanned: false
};

const getters = {
    getWatchedDirectories(state) {
        return state.watchedDirectories;
    },
    getPreviouslyScanned(state) {
        return state.previouslyScanned;
    }
};

const mutations = {
    addWatchedDirectory(state, directory) {
        state.watchedDirectories.push(directory);
    },
    removeWatchedDirectory(state, directory) {
        state.watchedDirectories = state.watchedDirectories.filter(s => s !== directory);
    }
};

const actions = {};

export default {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
}
