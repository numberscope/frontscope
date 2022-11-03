import {createApp} from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.config.errorHandler = err => {
    window.alert(`Numberscope experienced an error: ${err}`)
}

app.use(router)

app.mount('#app')
