import { RouteRecordRaw } from 'vue-router'
import Customers from '@/modules/sell/customer/views/Customers.vue'
import CustomerCreate from '@/modules/sell/customer/views/CustomerCreate.vue'
import CustomerEdit from '@/modules/sell/customer/views/CustomerEdit.vue'
import Customer from '@/modules/sell/customer/views/Customer.vue'

const adminCustomersRoutes: Array<RouteRecordRaw> = [
  {
    path: 'sell/customers',
    component: Customers,
    meta: {
      h2: 'Sell',
      span: 'Customers',
    },
  },
  {
    path: 'sell/customer/create',
    component: CustomerCreate,
    meta: {
      h2: 'Sell',
      span: 'Customers',
    },
  },
  {
    path: 'sell/customer/edit/:id',
    component: CustomerEdit,
    meta: {
      h2: 'Sell',
      span: 'Customers',
    },
  },
  {
    path: 'sell/customer/:id',
    component: Customer,
    meta: {
      h2: 'Sell',
      span: 'Customers',
    },
  },
]

export default adminCustomersRoutes
