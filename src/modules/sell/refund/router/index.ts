import { RouteRecordRaw } from 'vue-router'
import RefundCreate from '@/modules/sell/refund/views/RefundCreate.vue'

const adminRefundsRoutes: Array<RouteRecordRaw> = [
  {
    path: 'sell/refund/create',
    component: RefundCreate,
    meta: {
      h2: 'Sell',
      span: 'Refund',
    },
  },
]

export default adminRefundsRoutes
