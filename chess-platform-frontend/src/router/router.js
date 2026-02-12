import { createWebHistory, createRouter } from 'vue-router'

import LogInPage from '@/components/auth/LogInPage.vue'
import RegistrationForm from '@/components/auth/RegistrationForm.vue'
import MainPage from '@/pages/MainPage.vue'
import Play from '@/pages/PlayPage.vue'
import CoordinatesTraining from '@/pages/CoordinatesTraining.vue'
import ChessPuzzles from '@/pages/ChessPuzzles.vue'
import Profile from '@/pages/ProfilePage.vue'
import PrivacyPolicy from '@/components/auth/PrivacyPolicy.vue'
import InviteShare from '@/pages/InviteShare.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/login', component: LogInPage },
  { path: '/signup', component: RegistrationForm },
  { path: '/play', component: Play },
  { path: '/play/:roomId', name: 'PlayRoom', component: Play, props: true, },
  { path: '/coordinates', component: CoordinatesTraining },
  { path: '/puzzles', component: ChessPuzzles },
  { path: '/profile', component: Profile },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/inviteShare', component: InviteShare },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})