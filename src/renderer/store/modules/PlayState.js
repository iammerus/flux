const state = {
    isPlaying: false,
    lastPlayedSong: null
};

const getters = {
    getIsPlaying(state) {
        return state.isPlaying;
    },
    getLastPlayedSong(state) {
        return state.lastPlayedSong;
    }
};

const mutations = {
    setIsPlaying (state) {
        state.isPlaying = true;
    },
    setIsStoppedPlaying(state) {
      state.isPlaying = false
    },
    setLastPlayedSong(state, song) {
        state.lastPlayedSong = song;
    }
};

const actions = {

};

export default {
    state,
    mutations,
    actions,
    getters
}
