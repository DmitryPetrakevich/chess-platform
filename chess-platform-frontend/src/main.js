import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router/router'
import "@/assets/styles/globals.less";
import "@/assets/styles/variables.less";
import App from './App.vue'

import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

app.use(router).mount('#app')