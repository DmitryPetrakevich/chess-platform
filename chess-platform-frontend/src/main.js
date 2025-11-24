import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/router'
import "@/assets/styles/globals.less";
import App from './App.vue'

const app = createApp(App)

// создаём экземпляр pinia
const pinia = createPinia()

// подключаем pinia к приложению
app.use(pinia)

app.use(router).mount('#app')