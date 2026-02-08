import { TMeta } from '@/types/globalTypes.ts'

export type TPromotions = {
  data: TPromotion[]
  meta: TMeta
}

export type TPromotion = {
  id?: string
  name: string
  start_date: string
  end_date: string
  products?: any
  promotionProducts?: any
}

export type TPromotionError = {
  name: string
  start_date: string
  end_date: string
  products?: any
}

export type TQuery = {
  page?: number
  include?: string[]
  all?: string
  per_page?: number
  start_date?: string
}
