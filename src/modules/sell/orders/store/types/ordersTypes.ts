import { TRelatedProduct } from '@/modules/others/relatedProduct/store/types/relatedTypes.ts'
import { TCustomer } from '@/modules/sell/customer/store/types/customerTypes.ts'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes.ts'
import { TMeta } from '@/types/globalTypes.ts'
import { ORDER_STATUS } from '../../constants'
import { TStock } from '@/modules/stocks/store/types/stockTypes'

export type TOrdersItems = {
  data: TOrdersItem[]
  meta: TMeta
  missing_products?: TMissingProduct[]
}

export type approvedData = {
  pack_quantity: string
  pallet_quantity: string
  product_name: string
  quantity: string
  total_price: string
}

export type TOrdersItem = {
  address: string
  created_at: string
  custom_discount: string
  deleted_at: string
  missing: boolean
  missing_product_list: TMissingProduct[]
  id: number
  order_date: string
  order_items: TOrderItem[]
  paid: 0 | 1
  paid_amount: number
  orderItems: { data: TOrderItem[] }
  batchItem: { data: { product: { data: TProduct } } }
  transfer_is_delivered: boolean
  pallet_quantity: number
  pack_quantity: number
  order_total_price: string
  product_promotion_total_discount: string
  shipping_cost: string
  shipping_type: number
  status: number
  total_shipping_cost: string
  updated_at: string
  user_id: number
  user: TCustomer
  user_tariff_total_discount: string
}

export type TMissingProduct = {
  missing_product_id: number
  missing_quantity: number
  missing_product_name: string
  missing_pallets: number
  missing_packs: number
}

export type TOrder = {
  address: string
  created_at: string
  custom_discount: string
  missing_product_list: TMissingProduct[]
  deleted_at: string
  transfer_is_delivered: boolean
  id: number
  missing: boolean
  order_date: string
  order_items: TOrderItem[]
  orderItems: { data: TOrderItem[] }
  groupedOrderRelatedProducts: {
    data: [
      {
        related_product_id: string
        price: string
        quantity: string | number
      },
    ]
  }
  temporaryOrderRefundForRelatedProduct: {
    data: [
      {
        total_price: string
        price: string
        quantity: string | number
        product?: { data: TProduct }
      },
    ]
  }
  order_total_price: string
  order_subtotal_price: string
  product_promotion_total_discount: string
  shipping_cost: string
  shipping_type: number
  status: number
  total_shipping_cost: string
  updated_at: string
  delivery_date: string
  user_id: number
  user: { data: TCustomer }
  user_tariff_total_discount: string
}

export type TOrdersErrors = {
  name: string
  user_id: string
  order_shipping_cost: string
  total_shipping_cost: string
  order_address: string
  order_date: string
  stock_id: string
  custom_order_discount: string
  refund_date: string
}

export type TOrderItem = {
  id?: number
  is_original?: boolean
  product_id?: string | number
  refund?: boolean
  batch_item_id?: string
  batchItem?: {
    data: {
      product: { data: TProduct }
      quantity?: number
      reserved_quantity?: number | string
      expiry_date?: string
      stock?: TStock
    }
    quantity?: number
  }
  price_per_pack?: string
  discount?: string
  pack_quantity?: string
  promotion_type?: string
  product?: TRelatedProduct | TProduct
  batch?: {
    palletQuantity?: number
    packQuantity?: number
    quantity?: number
    reserved_quantity?: number | string
    lot_number?: string
    original_price_per_pack?: string
    id?: string
    product?: TProduct
    stock?: TStock
  }
  quantity?: string
  old_quantity?: string
  price?: string
  lot_number?: string
  product_promotion_amount?: string
  product_promotion_discount?: string
  user_tariff_discount?: string
  final_price?: string
  pallet_quantity?: { value?: string }
  original_pallet_quantity?: { value?: string }
  expire_date?: string
  expiry_date?: string
  custom_discount?: string
}

export type TOrdersFilters = {
  per_page?: number
  status?: number
  page?: number
  start_date?: string
  all?: string
  'sort[]': string
}

export type TOrderStatus = keyof typeof ORDER_STATUS
