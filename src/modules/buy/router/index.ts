import { RouteRecordRaw } from 'vue-router'
import adminBuyProvidersRoutes from '@/modules/buy/providers/router'
import StatusBatch from '../views/StatusBatch.vue'
import HistoryBatch from '../views/HistoryBatch.vue'
import Payment from '../../../components/payment/Payment.vue'
import EditBatch from '../views/EditBatch.vue'
import AddNewBatch from '../views/AddNewBatch.vue'

const adminBuyRoutes: Array<RouteRecordRaw> = [
  ...adminBuyProvidersRoutes,
  {
    path: '/admin/buy/status-batch',
    component: StatusBatch,
    meta: {
      h2: 'Buy',
      span: 'Batch_Status',
    },
  },
  {
    path: '/admin/buy/history-batch',
    component: HistoryBatch,
    meta: {
      h2: 'Buy',
      span: 'Batch_History',
    },
  },
  {
    path: '/admin/buy/payment',
    component: Payment,
    meta: {
      h2: 'Buy',
      span: 'Payment',
    },
  },
  {
    path: 'buy/:stock/add-new-batch',
    component: AddNewBatch,
    meta: {
      h2: 'Buy',
      span: 'New_Batch',
    },
  },
  {
    path: 'buy/view-batch/:batch_id',
    component: EditBatch,
    meta: {
      h2: 'Buy',
      span: 'View_Batch',
    },
  },
  {
    path: 'buy/edit-batch/:batch_id',
    component: EditBatch,
    meta: {
      h2: 'Buy',
      span: 'Edit_batch',
    },
  },
  {
    path: 'buy/view-batch-history/:batch_id',
    component: EditBatch,
    meta: {
      h2: 'Buy',
      span: 'View_Batch_History',
    },
  },
]

export default adminBuyRoutes
