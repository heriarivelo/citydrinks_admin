export type TMeta = {
  pagination: TPagination
}

export type TPagination = {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

export type Meta = {
  per_page: number
  last_page: number
}

export type PaymentType = 'buy' | 'sell'

export type BatchStatus = 'status_delivered' | 'status_approved' | 'status_paid'
