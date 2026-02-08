import { RouteRecordRaw } from 'vue-router'
import Promotions from '@/modules/sell/promotion/views/Promotions.vue'
import PromotionsCreate from '@/modules/sell/promotion/views/PromotionsCreate.vue'
import PromotionsEdit from '@/modules/sell/promotion/views/PromotionsEdit.vue'
import Promotion from '@/modules/sell/promotion/views/Promotion.vue'

const adminPromotionsRoutes: Array<RouteRecordRaw> = [
  {
    path: 'sell/promotion',
    component: Promotions,
    meta: {
      h2: 'Sell',
      span: 'Promotion',
    },
  },
  {
    path: 'sell/promotion/create',
    component: PromotionsCreate,
    meta: {
      h2: 'Sell',
      span: 'Promotion',
    },
  },
  {
    path: 'sell/promotion/edit/:id',
    component: PromotionsEdit,
    meta: {
      h2: 'Sell',
      span: 'Promotion',
    },
  },
  {
    path: 'sell/promotion/:id',
    component: Promotion,
    meta: {
      h2: 'Sell',
      span: 'Promotion',
    },
  },
]

export default adminPromotionsRoutes
