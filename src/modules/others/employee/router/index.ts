import { RouteRecordRaw } from 'vue-router'
import Employees from '@/modules/others/employee/views/Employees.vue'
import EmployeesCreate from '@/modules/others/employee/views/EmployeesCreate.vue'
import Employee from '@/modules/others/employee/views/Employee.vue'
import EmployeeEdit from '@/modules/others/employee/views/EmployeeEdit.vue'

const adminOthersEmployeesRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/employees',
    component: Employees,
    meta: {
      h2: 'Others',
      span: 'Employees',
    },
  },
  {
    path: 'others/employees/create',
    component: EmployeesCreate,
    meta: {
      h2: 'Others',
      span: 'Employees',
    },
  },
  {
    path: 'others/employees/:id',
    component: Employee,
    meta: {
      h2: 'Others',
      span: 'Employees',
    },
  },
  {
    path: 'others/employees/edit/:id',
    component: EmployeeEdit,
    meta: {
      h2: 'Others',
      span: 'Employees',
    },
  },
]

export default adminOthersEmployeesRoutes
