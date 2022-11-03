import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {alertError} from './shared/alertError.js'

const app = createApp(App)
app.config.errorHandler = e => {
    alertError(e)
}

app.use(router)

app.mount('#app')
