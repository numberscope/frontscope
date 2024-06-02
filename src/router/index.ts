import Scope from '../views/Scope.vue'
import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'scope',
            component: Scope,
        },
    ],
})

export default router
