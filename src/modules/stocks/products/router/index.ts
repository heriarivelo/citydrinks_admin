import { RouteRecordRaw } from 'vue-router'
import Products from '@/modules/stocks/products/views/Products.vue'
import ProductsCreate from '@/modules/stocks/products/views/ProductsCreate.vue'
import ProductEdit from '@/modules/stocks/products/views/ProductEdit.vue'
import Product from '@/modules/stocks/products/views/Product.vue'

const adminProductsRoutes: Array<RouteRecordRaw> = [
  {
    path: 'stocks/products/:page?',
    component: Products,
    meta: {
      h2: 'Stocks',
      span: 'Products',
    },
  },
  {
    path: 'stocks/products/create',
    component: ProductsCreate,
    meta: {
      h2: 'Stocks',
      span: 'Products',
    },
  },
  {
    path: 'stocks/products/edit/:id',
    component: ProductEdit,
    meta: {
      h2: 'Stocks',
      span: 'Products',
    },
  },
  {
    path: 'stocks/products/product/:id',
    component: Product,
    meta: {
      h2: 'Stocks',
      span: 'Products',
    },
  },
]

export default adminProductsRoutes
