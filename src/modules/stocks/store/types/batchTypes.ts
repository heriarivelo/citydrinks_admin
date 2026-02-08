import { TMeta } from '@/types/globalTypes.ts'

export type TBatchErrors = {
  internal_code: string
  provider_id: string
  stock_id: string
  batch_items: string
  available_date: string
}

export type TBatchTransferErrors = {
  sender_stock_id: string
  receiver_stock_id: string
}

export type TBatchQuery = {
  page: number
  per_page: number
  all: string
  include: Array<string>
  provider_id: string | number
  created_at: string
  stock_id: string
}

export type TBatches = {
  data: TBatch[]
  meta: TMeta
}

export type TBatch = {
  id?: string | number
  provider_id?: string
  balance?: string | number
  available_date?: string
  stock_id?: string
  stock?: any
  provider?: any
  internal_code?: string
  status?: string
  total_cost?: string
  total_price?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
  status_delivered?: string | number
  status_approved?: string | number
  status_paid?: string | number
  items?: any
  relatedItems?: any
}
