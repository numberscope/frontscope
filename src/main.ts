import DOMPurify from 'dompurify'
import {createApp} from 'vue'

import App from './App.vue'
import router from './router'
import {alertMessage} from './shared/alertMessage'

const app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
    console.error(`ERROR in Vue component ${vm}:`, err)
    console.warn('    Additional information:', info)
    window.alert(alertMessage(err))
}

try {
    app.use(router)
} catch (e: unknown) {
    console.error('ERROR while establishing router:', e)
}

app.directive('safe-html', (el, binding) => {
    el.innerHTML = DOMPurify.sanitize(binding.value)
})

app.mount('#app')
