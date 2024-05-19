import HomeOld from '../views/Home.vue'
import ScopeOld from '../views/Scope.vue'
import HomeNew from '../views-new/Home.vue'
import ScopeNew from '../views-new/Scope.vue'
import Gallery from '../views-new/Gallery.vue'
import {createRouter, createWebHistory} from 'vue-router'

const views =
    import.meta.env.VITE_USE_NEW_UI === 'true'
        ? {
              // New views go here
              home: HomeNew,
              scope: ScopeNew,
              gallery: Gallery,
          }
        : {
              // Old views go here
              home: HomeOld,
              scope: ScopeOld,
              gallery: Gallery,
          }

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: views['home'],
        },
        {
            path: '/scope',
            name: 'scope',
            component: views['scope'],
        },
        {
            path: '/gallery',
            name: 'gallery',
            component: views['gallery'],
        },
    ],
})

export default router
