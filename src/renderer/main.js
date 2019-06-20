import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import Globals from "^/core/utils/Globals";
import VuexStateWrapper from "^/core/state/VuexStateWrapper";
import Library from "^/core/audio/types/Library";
import Player from "^/core/audio/Player";

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
const app = new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
});

Globals.setVueInstance(app);

const stateWrapper = new VuexStateWrapper();

Vue.eventHub = Vue.prototype.$eventHub = new Vue(); // Global event bus
Vue.library = Vue.prototype.$library = new Library(stateWrapper);
Vue.player = Vue.prototype.$player = new Player(Vue.library);

app.$mount('#app');