import { createWebHistory, createRouter } from 'vue-router'

import LogInPage from '@/components/LogInPage.vue'
import RegistrationForm from '@/components/RegistrationForm.vue'
import MainPage from '@/components/MainPage.vue'
import Play from '@/pages/Play.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/login', component: LogInPage },
  { path: '/signup', component: RegistrationForm },
  { path: '/play', component: Play },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})