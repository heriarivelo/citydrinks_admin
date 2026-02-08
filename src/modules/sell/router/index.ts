import adminOrdersRoutes from '@/modules/sell/orders/router'
import adminRefundRoutes from '@/modules/sell/refund/router'
import adminShippingRoutes from '@/modules/others/shipping/router'
import { RouteRecordRaw } from 'vue-router'
import adminCustomersRoutes from '../customer/router'
import adminPromotionsRoutes from '@/modules/sell/promotion/router'
import Payment from '@/components/payment/Payment.vue'

const adminSellRoutes: Array<RouteRecordRaw> = [
  ...adminOrdersRoutes,
  ...adminRefundRoutes,
  ...adminShippingRoutes,
  ...adminCustomersRoutes,
  ...adminPromotionsRoutes,
  {
    path: 'sell/payment',
    component: Payment,
    meta: {
      h2: 'Sell',
      span: 'Payment',
    },
  },
]

export default adminSellRoutes
