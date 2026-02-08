import AdminLayout from '@/layouts/AdminLayout.vue'
import adminDashboardRoutes from '@/modules/dashboard/router'
import adminStockRoutes from '@/modules/stocks/router'
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import AdminAuth from '@/views/AdminAuth.vue'
import ForgetPassword from '@/views/ForgetPassword.vue'
import { storeToRefs } from 'pinia'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import adminBuyRoutes from '@/modules/buy/router'
import adminOthersEmployeesRoutes from '@/modules/others/employee/router'

import adminOthersRoutes from '@/modules/others/router'
import adminSellRoutes from '@/modules/sell/router'
import { useModalStore } from '@/store/modal'
import adminProfileRoutes from '@/modules/profile/router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      ...adminDashboardRoutes,
      ...adminProfileRoutes,
      ...adminStockRoutes,
      ...adminBuyRoutes,
      ...adminSellRoutes,
      ...adminOthersEmployeesRoutes,
      ...adminOthersRoutes,
    ],
  },
  {
    path: '/',
    name: 'Admin-Login',
    component: AdminAuth,
  },
  {
    path: '/login',
    name: 'Auth',
    component: AdminAuth,
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: ForgetPassword,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAdminAuthStore()
  const modalStore = useModalStore()
  const { me, auth } = storeToRefs(authStore)

  // If form is dirty, show confirmation dialog and store navigation info
  if (modalStore.isFormDirty) {
    modalStore.setTargetRoute(to)
    modalStore.setIsDialogOpen(true)
    return next(false)
  }

  // Handle authentication logic
  if (
    auth.value &&
    !me.value?.one_time_password &&
    !to.matched.some((record) => record.meta.requiresAuth)
  ) {
    return next({
      path: '/admin/dashboard',
    })
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!auth.value || me.value?.one_time_password) {
      return next({
        path: '/login',
      })
    }
  }

  return next()
})

export default router
