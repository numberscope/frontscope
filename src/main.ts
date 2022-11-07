import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {alertMessage} from './shared/alertMessage.js'

const app = createApp(App)
app.config.errorHandler = e => {
    window.alert(alertMessage(e))
}

app.use(router)

app.mount('#app')
