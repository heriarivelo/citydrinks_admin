import { RouteRecordRaw } from 'vue-router'
import Profile from '@/modules/profile/veiws/Profile.vue'

const adminProfileRoutes: Array<RouteRecordRaw> = [
  {
    path: 'profile',
    component: Profile,
    meta: {
      h2: 'Profile',
      span: 'My_account',
    },
  },
]

export default adminProfileRoutes
