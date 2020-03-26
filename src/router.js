import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import ToolMain from '@/views/ToolMain.vue';
import VueTest from '@/views/VueTest.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
        {
                path: '/',
                name: 'Home',
                component: Home,
        },
        {
                path: '/canvas',
                name: 'Canvas',
                component: ToolMain,
        },
        {
                path: '/vuetest',
                name: 'VueTest',
                component: VueTest,
        },
  ],
});
