import { TMeta } from '@/types/globalTypes.ts'
import { TCategory } from '@/store/types/categoryTypes.ts'

export type TProducts = {
  data: TProduct[]
  meta: TMeta
}

export type TQuery = {
  page?: number
  include?: string[]
  all?: string
  'batchItems:available_date'?: string
  per_page?: number
  withoutActivePromotion?: number
}

interface Limits {
  [index: number]: number
}

interface Tariff {
  tariff_id: number
  price: number
  tariff: any
}

export interface RelatedProduct {
  related_product_id: number
  related_product: TRelated_product
  quantity?: number | string
}

interface TRelated_product {
  related_product_id: number
  id: number
  name: string
  price: string
  related_with: string
  related_product: any
}

export type TProduct = {
  id: number
  name: string
  category_id: number
  pack_usage: number
  packQuantity: number
  palletQuantity: number
  related_product_id: number
  price_per_pack: string
  original_price_per_pack?: string
  reserved_quantity?: number | string
  product_cost: string
  isProduct: boolean
  isRelatedProduct: boolean
  packs_quantity_per_pallet: number
  quantity: number | string
  product_image: string
  limits: Limits
  tariffs: Tariff[]
  product_limits_per_pack: any
  related_products: RelatedProduct[]
  relatedProductsCustom: RelatedProduct[]
  related_product: RelatedProduct
  relatedProducts: {
    data: TRelated_product[]
  }
  active_promotions?: {
    id: number
    name: string
    start_date: string
    end_date: string
    created_at: string
    updated_at: string
    pivot: {
      product_id: number
      promotion_id: number
      amount: string
      type: number
    }
  }[]
  category: {
    data: TCategory
  }
  productLimitsPerPack: {
    data: TProductLimitsPerPack[]
  }
  productTariffs: {
    data: TProductTariff[]
  }
  status: string
  is_user_tariff: boolean
  price_with_user_tariff: string | number
  price_with_promotion: string | number
  price_without_promotion: string
  user_tariff: string
  discount_type: string
}

export type TProductErrors = {
  id: string
  name: string
  category_id: string
  product_image: string
  pack_usage: string
  price_per_pack: string
  product_cost: string
  packs_quantity_per_pallet: string
  limits: string
  tariffs: string
  related_products: string
  price: string
}

export type TProductLimitsPerPack = {
  id: number
  limit: number
  product_id: number
}
export type TProductTariff = {
  id: number
  price: number
  product_id: number
  tariff_id: number
  tariff: any
}
