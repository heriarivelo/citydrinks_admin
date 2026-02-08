import { TBatch } from '@/modules/buy/types/batchTypes'
import { TOrdersItem } from '@/modules/sell/orders/store/types/ordersTypes'

export type Payment = {
  id: number
  name: string
  disabled: boolean
  customer_id: number
  balance: string
  amount: string
  date: string
  input_date: string
  type: string
  refill: 0 | 1
  description: string
  balance_after: string
  order: TOrdersItem | null
  batch: TBatch | null
  items: Payment[]
}

export type PaymentDialog = {
  id?: number
  order_id?: number
  batch_id?: number
  date?: string
  provider?: string
  company?: string
  balance: number | string
  document_purpose?: string
}
