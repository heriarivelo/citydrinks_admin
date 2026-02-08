import { RouteRecordRaw } from 'vue-router'
import Providers from '@/modules/buy/providers/views/Providers.vue'
import ProvidersCreate from '@/modules/buy/providers/views/ProvidersCreate.vue'
import ProvidersEdit from '@/modules/buy/providers/views/ProvidersEdit.vue'
import Provider from '@/modules/buy/providers/views/Provider.vue'

const adminBuyProvidersRoutes: Array<RouteRecordRaw> = [
  {
    path: 'buy/providers',
    component: Providers,
    meta: {
      h2: 'Buy',
      span: 'Providers',
    },
  },
  {
    path: 'buy/providers/create',
    component: ProvidersCreate,
    meta: {
      h2: 'Buy',
      span: 'Providers',
    },
  },
  {
    path: 'buy/providers/edit/:id',
    component: ProvidersEdit,
    meta: {
      h2: 'Buy',
      span: 'Providers',
    },
  },
  {
    path: 'buy/providers/:id',
    component: Provider,
    meta: {
      h2: 'Buy',
      span: 'Providers',
    },
  },
]

export default adminBuyProvidersRoutes
