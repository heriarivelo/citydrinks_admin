import { RouteRecordRaw } from 'vue-router'
import Stock from '@/modules/stocks/views/Stock.vue'
import EditProduct from '@/modules/stocks/views/EditProduct.vue'
import TransferProducts from '@/modules/stocks/views/TransferProducts.vue'
import HistoryProduct from '../views/HistoryProduct.vue'
import AllStocks from '../views/AllStocks.vue'
import adminProductsRoutes from '@/modules/stocks/products/router'
import TransferStatus from '../views/TransferStatus.vue'

const adminStockRoutes: Array<RouteRecordRaw> = [
  ...adminProductsRoutes,
  {
    path: 'stocks/all-stocks',
    component: AllStocks,
    meta: {
      h2: 'Stocks',
      span: 'All_Stocks',
    },
  },
  {
    path: 'stocks/transfer-status',
    component: TransferStatus,
    meta: {
      h2: 'Stocks',
      span: 'Transfer_Status',
    },
  },
  {
    path: 'stocks/:stock',
    component: Stock,
    meta: {
      h2: 'Stocks',
    },
  },
  {
    path: 'stocks/:stock/edit-product/:product_id',
    component: EditProduct,
    meta: {
      h2: 'Stocks',
    },
  },

  {
    path: 'stocks/:stock/transfer-products/:product_id?',
    component: TransferProducts,
    meta: {
      h2: 'Stocks',
      span: 'Transfer_Products',
    },
  },
  {
    path: 'stocks/history-product',
    component: HistoryProduct,
    meta: {
      h2: 'Stocks',
      span: 'History_Product',
    },
  },
]

export default adminStockRoutes
