import About from '../views/About.vue'
import Help from '../views/Help.vue'
import Home from '../views/Home.vue'
import Scope from '../views/Scope.vue'
import {createRouter, createWebHistory} from 'vue-router'
import Acknowledgements from '../views/Acknowledgements.vue'
import UserManual from '../views/UserManual.vue'

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
        {
            path: '/about',
            name: 'about',
            component: About,
        },
        {
            path: '/help',
            name: 'help',
            component: Help,
        },
        {
            path: '/acknowledgements',
            name: 'acknowledgments',
            component: Acknowledgements,
        },
        {
            path: '/documentation',
            name: 'documentation',
            component: UserManual,
        },
    ],
})

export default router
