import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', component: MainView },
  { path: '/auth', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/reset-password/:token', component: LoginView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
