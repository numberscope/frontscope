import DOMPurify from 'dompurify'
import {createApp} from 'vue'

import App from './App.vue'
import router from './router'
import {alertMessage} from './shared/alertMessage'

const app = createApp(App)
if (import.meta.env.VITE_WORKBENCH === '1') {
    app.config.errorHandler = (err, vm, info) => {
        console.error('ERROR HANDLER', err, vm, info)
    }
} else {
    app.config.errorHandler = e => {
        window.alert(alertMessage(e))
    }
}

app.use(router)

app.directive('safe-html', (el, binding) => {
    el.innerHTML = DOMPurify.sanitize(binding.value)
})

app.mount('#app')
