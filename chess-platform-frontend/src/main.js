import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// создаём экземпляр pinia
const pinia = createPinia()

// подключаем pinia к приложению
app.use(pinia)

app.mount('#app')