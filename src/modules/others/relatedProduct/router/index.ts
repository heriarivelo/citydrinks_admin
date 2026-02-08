import { RouteRecordRaw } from 'vue-router'
import RelatedProducts from '@/modules/others/relatedProduct/views/RelatedProducts.vue'
import RelatedProductsCreate from '@/modules/others/relatedProduct/views/RelatedProductsCreate.vue'

const adminRelatedProductsRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/related',
    component: RelatedProducts,
    meta: {
      h2: 'Others',
      span: 'Related_Products',
    },
  },
  {
    path: 'others/related/create',
    component: RelatedProductsCreate,
    meta: {
      h2: 'Others',
      span: 'Related_Products',
    },
  },
]

export default adminRelatedProductsRoutes
