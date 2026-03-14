import { createWebHistory, createRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

import LogInPage from '@/components/auth/LogInPage.vue'
import RegistrationForm from '@/components/auth/RegistrationForm.vue'
import MainPage from '@/pages/MainPage.vue'
import Play from '@/pages/PlayPage.vue'
import CoordinatesTraining from '@/pages/CoordinatesTraining.vue'
import ChessPuzzles from '@/pages/ChessPuzzles.vue'
import Profile from '@/pages/ProfilePage.vue'
import PrivacyPolicy from '@/components/auth/PrivacyPolicy.vue'
import InviteShare from '@/pages/InviteShare.vue'
import GameReview from '@/pages/GameReview.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/login', component: LogInPage },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/signup', component: RegistrationForm },
  { path: '/play', component: Play, meta: {requiresAuth: true} },
  { path: '/play/:roomId', name: 'PlayRoom', component: Play, props: true, meta: {requiresAuth: true} },
  { path: '/coordinates', component: CoordinatesTraining },
  { path: '/puzzles', component: ChessPuzzles },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/inviteShare', component: InviteShare, meta: {requiresAuth: true} },
  { path: '/game/:id', name: 'GameReview', component: GameReview, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if(to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({path: '/login'})
  } else {
    next()
  }
})

export { router }