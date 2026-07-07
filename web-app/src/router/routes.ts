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
import BankItemDetail from '@/components/BankItemDetail.vue'
import ItemDetail from '@/components/ItemDetail.vue'
import MyItemsPage from '@/pages/MyItemsPage.vue'
import AddBankItemToEnquetePage from '@/pages/AddBankItemToEnquetePage.vue'
import EnqueteDetail from '@/components/EnqueteDetail.vue'
import MyAccountPage from '@/pages/MyAccountPage.vue'
import ModaliteItemPage from '@/pages/ModaliteItemPage.vue'
import ItemAddPage from '@/pages/ItemAddPage.vue'
import BankAddPage from '@/pages/BankAddPage.vue'
import EnqueteStartPage from '@/pages/EnqueteStartPage.vue'
import AdminGestionUsersPage from '@/pages/AdminGestionUsersPage.vue'
import PreviewEnquetePage from '@/pages/PreviewEnquetePage.vue'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.vue'
import ResetPasswordPage  from '@/pages/ResetPasswordPage.vue'
import AdminGestionEnquetesPage from '@/pages/AdminGestionEnquetesPage.vue'
import AdminGestionBanksPage from '@/pages/AdminGestionBanksPage.vue'
import AdminGestionItemsPage from '@/pages/AdminGestionItemsPage.vue'

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
    path: '/bank-item/:bankItemId',
    name: 'bank-item-detail',
    component: BankItemDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/bank-item/:bankItemId/items',
    name: 'item-add',
    component: ItemAddPage,
    meta: { requiresAuth: true }
  },
   {
    path: '/item/:itemId',
    name: 'item-detail',
    component: ItemDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/item/:itemId/modalites',
    name: 'item-modalites',
    component: ModaliteItemPage,
    meta: { requiresAuth: true }
  },
    {
    path: '/enquete/:enqueteId',
    name: 'enquete-detail',
    component: EnqueteDetail,
    meta: { requiresAuth: true }
  },
    {
      path: '/enquete/:enqueteId/banks',
      name: 'enquete-banks',
      component: BankAddPage,
      meta: { requiresAuth: true }
    },
  {
    path: '/create-item',
    name: 'create-item',
    component: CreateItemPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-item-to-bank',
    name: 'add-item-to-bank',
    component: AddItemToBankPage,
    meta: { requiresAuth: true }
  },
   {
    path: '/add-bank-to-enquete',
    name: 'add-bank-to-enquete',
    component: AddBankItemToEnquetePage,
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
    path: '/my-items',
    name: 'my-items',
    component: MyItemsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/preview-enquete',
    name: 'preview-enquete',
    component: PreviewEnquetePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/survey/:url(.*)',
    name: 'public-survey',
    component: EnqueteStartPage,
    meta: { requiresAuth: false }
  },
 {
  path: '/forgot-password',
  name: 'forgot-password',
  component: ForgotPasswordPage,
  meta: { requiresAuth: false }
},
{
  path: '/reset-password',
  name: 'reset-password',
  component: ResetPasswordPage,
  meta: { requiresAuth: false }
},
  {
    path: '/my-account',
    name: 'my-account',
    component: MyAccountPage,
    meta: { requiresAuth: true }
  },
  
    {
    path: '/admin-gestion-users',
    name: 'admin-gestion-users',
    component: AdminGestionUsersPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-gestion-enquetes',
    name: 'admin-gestion-enquetes',
    component: AdminGestionEnquetesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-gestion-banks',
    name: 'admin-gestion-banks',
    component: AdminGestionBanksPage,
    meta: { requiresAuth: true }
  },
    {
    path: '/admin-gestion-items',
    name: 'admin-gestion-items',
    component: AdminGestionItemsPage,
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


router.beforeEach(async (to, from, next) => {
  const storeAuth = useAuthStore()
  const authenticated = storeAuth.getToken()
  const requiresAuth = to.meta.requiresAuth

  if (authenticated && !storeAuth.user) {
    await storeAuth.fetchUserInfo()
  }

  const userRole = storeAuth.user?.role

  const adminRoutes = ['admin-gestion-users', 'admin-gestion-banks', 'admin-gestion-enquetes', 'admin-gestion-items', 'admin-create-users']
  if (adminRoutes.includes(to.name as string)) {
    if (userRole !== 'admin') {
      return next('/home')  
    }
  }

  if (requiresAuth && !authenticated) {
    return next('/login')
  }

  return next()
})