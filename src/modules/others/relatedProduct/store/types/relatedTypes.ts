import { TMeta } from '@/types/globalTypes.ts'

export type TRelatedProducts = {
  data: TRelatedProduct[]
  meta: TMeta
}

export type TRelatedProduct = {
  id: number
  name: string
  price: string
  cost_price: string
  related_with: 1 | 2
  created_at: string
  related_product: TRelatedProduct
  updated_at: string
  isProduct: boolean
  isRelatedProduct: boolean
  product_id: number | string
  related_product_id: number | string
  quantity?: number | string
}
export type TRelatedQuery = {
  page?: number
  per_page?: number
  all?: string
}
export type TRelatedErrors = {
  [key: string]: string
}
