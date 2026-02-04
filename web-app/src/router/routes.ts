import CreateBankItemPage from '@/pages/CreateBankItemPage.vue'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import CreateItemPage from '@/pages/CreateItemPage.vue'
import MyBankItemsPage from '@/pages/MyBankItemsPage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import AddItemToBankPage from '@/pages/AddItemToBankPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import CreateEnquetePage from '@/pages/CreateEnquetePage.vue'
import MyEnquetesPage from '@/pages/MyEnquetesPage.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-bank-item',
    name: 'create-bank-item',
    component: CreateBankItemPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-item',
    name: 'create-item',
    component: CreateItemPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-item-to-bank/:itemId',
    name: 'add-item-to-bank',
    component: AddItemToBankPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-enquete',
    name: 'create-enquete',
    component: CreateEnquetePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-enquetes',
    name: 'my-enquetes',
    component: MyEnquetesPage,
    meta: { requiresAuth: true }
  },

  {
    path: '/my-bank-items',
    name: 'my-bank-items',
    component: MyBankItemsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})



router.beforeEach((to, from, next) => {
  const storeAuth = useAuthStore()
  const authenticated = storeAuth.getToken()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && authenticated === null) {
    next('/login');  
  } else {
        next();
    }
})