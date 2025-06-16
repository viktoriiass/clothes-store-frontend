import { createRouter, createWebHistory } from 'vue-router'
import MainView   from '../views/MainView.vue'
import LoginView  from '../views/LoginView.vue'

const routes = [
  { path: '/',      name: 'Home',  component: MainView  },
  { path: '/login', name: 'Login', component: LoginView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
