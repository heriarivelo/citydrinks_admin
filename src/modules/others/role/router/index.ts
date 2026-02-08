import { RouteRecordRaw } from 'vue-router'

import RoleEdit from '@/modules/others/role/views/RoleEdit.vue'
import RoleCreate from '@/modules/others/role/views/RoleCreate.vue'
import Role from '@/modules/others/role/views/Role.vue'

const adminOthersRolesRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/roles',
    component: Role,
    meta: {
      h2: 'Others',
      span: 'Roles',
    },
  },
  {
    path: 'others/roles/create',
    component: RoleCreate,
    meta: {
      h2: 'Others',
      span: 'Roles',
    },
  },
  {
    path: 'others/roles/edit/:id',
    component: RoleEdit,
    meta: {
      h2: 'Others',
      span: 'Roles',
    },
  },
]

export default adminOthersRolesRoutes
