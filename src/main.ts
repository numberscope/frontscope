import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {alertMessage} from './shared/alertMessage'

const app = createApp(App)
if (import.meta.env.VITE_WORKBENCH !== '1') {
    app.config.errorHandler = e => {
        window.alert(alertMessage(e))
    }
}

app.use(router)

app.mount('#app')
