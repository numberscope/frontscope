import {createRouter, createWebHistory} from 'vue-router'

import {getCurrent} from '@/shared/browserCaching'
import Scope from '@/views/Scope.vue'
import Gallery from '@/views/Gallery.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'scope',
            component: Scope,
        },
        {
            path: '/gallery',
            name: 'gallery',
            component: Gallery,
        },
    ],
})

// Establish the default specimen if none is supplied via a query:
router.beforeEach(to => {
    if (to.fullPath === '/') return `/?${getCurrent().query}`
})

export default router
