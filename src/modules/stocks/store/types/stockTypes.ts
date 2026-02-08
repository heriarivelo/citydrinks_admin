import { TMeta } from '@/types/globalTypes.ts'

export type TStock = {
  type: string | number
  name: string
  id?: string
}

export type TStockError = {
  type: string | number
  name: string
  id?: string
}

export type TStockItems = {
  data: TStockItem[]
  meta: TMeta
}

export type TStockItem = {
  id?: string
  item_id?: string
  name?: string
  quantity?: string
  pack_usage?: string
  stock_id: number
  reserved_pallet_quantity?: string | number
  reserved_quantity?: string | number
  provider_name?: string
  statuses?: string
  min_available_date?: string
  pallet_quantity?: string | number
  pack_quantity?: string | number
  waiting_quantity?: string | number
  waiting_pallet_quantity?: string | number
  waiting_pack_quantity?: string | number
  total_pallet_quantity?: string | number
  total_pack_quantity?: string | number
  available_pallet_quantity?: string | number
  available_pack_quantity?: string | number
  blocked_quantity?: string | number
  blocked_pallet_quantity?: string | number
  blocked_pack_quantity?: string | number
}

export type TStockQuery = {
  page: number
  per_page: number
  all?: string
  stock?: string
  'sort[]'?: string
}
