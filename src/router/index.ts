import Vue from 'vue';
import Router from 'vue-router';
import App from '@/App.vue';

Vue.use(Router);
const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/home',
      name: 'home',
      component: App
    }
  ]
});

export default router;
