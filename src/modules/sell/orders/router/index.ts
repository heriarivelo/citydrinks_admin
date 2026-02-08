import { RouteRecordRaw } from 'vue-router'
import Orders from '@/modules/sell/orders/views/Orders.vue'
import OrdersCreate from '@/modules/sell/orders/views/OrdersCreate.vue'
import Order from '@/modules/sell/orders/views/Order.vue'
import OrdersEdit from '@/modules/sell/orders/views/OrdersEdit.vue'
import SeeAll from '@/modules/sell/orders/views/SeeAll.vue'
import OrderHistory from '@/modules/sell/orders/views/OrderHistory.vue'
import Debts from '../views/Debts.vue'

const adminOrdersRoutes: Array<RouteRecordRaw> = [
  {
    path: 'sell/orders',
    component: Orders,
    meta: {
      h2: 'Sell',
      span: 'Order_Status',
    },
  },
  {
    path: 'sell/orders/create',
    component: OrdersCreate,
    meta: {
      h2: 'Sell',
      span: 'Orders',
    },
  },
  {
    path: 'sell/orders/edit/:id',
    component: OrdersEdit,
    meta: {
      h2: 'Sell',
      span: 'Orders',
    },
  },
  {
    path: 'sell/orders/:id',
    component: Order,
    meta: {
      h2: 'Sell',
      span: 'Orders',
    },
  },
  {
    path: 'sell/see-all',
    component: SeeAll,
    meta: {
      h2: 'Sell',
      span: 'Order_Status',
      span2: 'See_All',
    },
  },
  {
    path: 'sell/debts',
    component: Debts,
    meta: {
      h2: 'Sell',
      span: 'Order_Status',
      span2: 'Debts',
    },
  },
  {
    path: 'sell/history',
    component: OrderHistory,
    meta: {
      h2: 'Order_History',
    },
  },
  {
    path: 'sell/history/:id',
    component: Order,
    props: { isHistory: true },
    meta: {
      h2: 'Sell',
      span: 'History',
    },
  },
]

export default adminOrdersRoutes
