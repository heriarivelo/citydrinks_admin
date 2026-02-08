import { RouteRecordRaw } from 'vue-router'
import Shippings from '@/modules/others/shipping/views/Shippings.vue'
import ShippingCreate from '@/modules/others/shipping/views/ShippingCreate.vue'
import ShippingEdit from '@/modules/others/shipping/views/ShippingEdit.vue'

const adminShippingRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/shipping',
    component: Shippings,
    meta: {
      h2: 'Others',
      span: 'Shipping',
    },
  },
  {
    path: 'others/shipping/create',
    component: ShippingCreate,
    meta: {
      h2: 'Others',
      span: 'Shipping',
    },
  },
  {
    path: 'others/shipping/edit/:id',
    component: ShippingEdit,
    meta: {
      h2: 'Others',
      span: 'Shipping',
    },
  },
]

export default adminShippingRoutes
