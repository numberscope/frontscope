import Gallery from '../views/Gallery.vue'
import Scope from '../views/Scope.vue'
import DragAndDrop from '../views/DragAndDrop.vue'
import {createRouter, createWebHistory} from 'vue-router'

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
        {
            path: '/dragAndDrop',
            name: 'dragAndDrop',
            component: DragAndDrop,
        },
    ],
})

export default router
