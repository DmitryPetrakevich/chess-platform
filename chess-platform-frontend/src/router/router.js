import { createWebHistory, createRouter } from 'vue-router'

import LogInPage from '@/components/LogInPage.vue'
import RegistrationForm from '@/components/RegistrationForm.vue'
import MainPage from '@/components/MainPage.vue'
import Play from '@/pages/Play.vue'
import CoordinatesTraining from '@/components/CoordinatesTraining.vue'
import ChessPuzzles from '@/components/ChessPuzzles.vue'
import Profile from '@/components/Profile.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/login', component: LogInPage },
  { path: '/signup', component: RegistrationForm },
  { path: '/play', component: Play },
  { path: '/coordinates', component: CoordinatesTraining },
  { path: '/puzzles', component: ChessPuzzles },
  { path: '/profile', component: Profile },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})