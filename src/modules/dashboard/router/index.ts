import { RouteRecordRaw } from 'vue-router'
import Dashboard from '@/modules/dashboard/views/Dashboard.vue'

const adminDashboardRoutes: Array<RouteRecordRaw> = [
  {
    path: 'dashboard',
    component: Dashboard,
    meta: {
      h2: 'Dashboard',
    },
  },
]

export default adminDashboardRoutes
