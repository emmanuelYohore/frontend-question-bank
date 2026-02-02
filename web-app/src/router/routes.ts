import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import NotFound from '@/pages/NotFound.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
   {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
   {
    path: '/register',
    name: 'register',
    component: RegisterPage,
  },
  {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
  }
 
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})