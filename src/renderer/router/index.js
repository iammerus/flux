import Vue from 'vue'
import Router from 'vue-router'
import Library from "@/components/Tabs/Library";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'music-library',
      component: Library
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
