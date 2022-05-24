import AboutView from '../views/AboutView.vue'
import HelpView from '../views/HelpView.vue'
import HomeView from '../views/HomeView.vue'
import ScopeView from '../views/ScopeView.vue'
import {createRouter, createWebHistory} from 'vue-router'
import AcknowledgementsView from '../views/AcknowledgementsView.vue'
import UserManualView from '../views/UserManualView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/scope',
            name: 'scope',
            component: ScopeView,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/help',
            name: 'help',
            component: HelpView,
        },
        {
            path: '/acknowledgements',
            name: 'acknowledgments',
            component: AcknowledgementsView,
        },
        {
            path: '/documentation',
            name: 'documentation',
            component: UserManualView,
        },
    ],
})

export default router
