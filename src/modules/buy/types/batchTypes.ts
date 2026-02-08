export type TBatch = {
  id: number
  provider_id: number
  stock_id: number
  internal_code: string
  status_delivered: number
  status_approved: number
  status_paid: number
  total_cost: string
  paid_amount: number
  total_price: string
  available_date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  balance: number
  stock: string
  provider: string
}
