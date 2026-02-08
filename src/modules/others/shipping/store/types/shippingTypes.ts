import { TMeta } from '@/types/globalTypes.ts'

export type TShippings = {
  data: TShipping[]
  meta: TMeta
}

export type TShipping = {
  id?: number
  name: string
  type?: string
  cost: string | number
}
export type TShippingQuery = {
  page?: number
  per_page?: number
  all?: string
}
export type TShippingErrors = {
  [key: string]: string
}
