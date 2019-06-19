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
    /**
     * Sets a boolean value indicating that the player is playing a song
     * 
     * @param {*} state 
     */
    setIsPlaying (state) {
        state.isPlaying = true;
    },

    /**
     * Set a boolean value indicating that the player has stopped playing 
     * 
     * @param {*} state 
     */
    setIsStoppedPlaying(state) {
      state.isPlaying = false
    },

    /**
     * Sets the current playing song
     * 
     * @param {*} state 
     * @param {*} song 
     */
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
