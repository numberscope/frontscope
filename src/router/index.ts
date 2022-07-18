import Home from '../views/Home.vue'
import Scope from '../views/Scope.vue'
import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/scope',
            name: 'scope',
            component: Scope,
        },
    ],
})

export default router
