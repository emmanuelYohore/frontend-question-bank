import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
  },
  // {
  //   path: '/404',
  //   name: 'Not found',
  //   component: NotFoundView,
  // },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFoundView',
  //  component: NotFoundView,
  // },
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})