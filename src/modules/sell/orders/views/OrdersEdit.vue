<script setup lang="ts">
import IconMinus from '@/components/icons/IconMinus.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { Button } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import SingleSelectCreatable from '@/components/ui/selects/SingleSelectCreatable.vue'
import UIButton from '@/components/ui/UIButton.vue'
import {
  calculatePromotionalPricePerPack,
  formatCurrency,
  parseEuroCurrency,
  parseNumber,
} from '@/lib/utils'
import { useCustomerStore } from '@/modules/sell/customer/store/customer.ts'
import { TCustomer } from '@/modules/sell/customer/store/types/customerTypes.ts'
import { useOrdersStore } from '@/modules/sell/orders/store/orders.ts'
import {
  TOrderItem,
  TOrdersErrors,
} from '@/modules/sell/orders/store/types/ordersTypes.ts'
import { SHIPPING_TYPE } from '@/modules/stocks/constants'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes.ts'
import { TRelatedProduct } from '@/modules/others/relatedProduct/store/types/relatedTypes'
import { useModalStore } from '@/store/modal'
import { useNotificationStore } from '@/store/notification'
import { Pencil } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { TStock } from '@/modules/stocks/store/types/stockTypes'

const queryClient = useQueryClient()
const customerStore = useCustomerStore()
const productStore = useProductStore()
const modalStore = useModalStore()
const ordersStore = useOrdersStore()
const notificationStore = useNotificationStore()
const { customers } = storeToRefs(customerStore)
const { order } = storeToRefs(ordersStore)
const { productBatches, refundProductList } = storeToRefs(productStore)
const { filters } = storeToRefs(ordersStore)
const router = useRouter()
const errors = ref({} as TOrdersErrors)
const isSubmitting = ref(false)
const productBatchesLotNumbers = ref(
  {} as {
    [key: string]: [
      {
        id: string
        lot_number: string
        palletQuantity: number
        quantity: number
        expiry_date: string
        price_per_pack: string
        packQuantity: number
        product: TProduct
        stock?: TStock
      },
    ]
  }
)
const route = useRoute()

const formData = ref({
  order_address: '',
  order_date: '',
  custom_order_discount: '',
  user_id: '',
  order_shipping_cost: '',
  total_shipping_cost: '',
  order_shipping_name: '',
  user: {} as TCustomer,
  data: [] as TOrderItem[],
  deletedItems: [],
})

const getPacks = (product: TProduct) => {
  const finalLimits =
    product?.product_limits_per_pack?.map((item) => {
      return {
        limit: item.limit + '',
        name: item.limit + '',
      }
    }) || []

  return finalLimits.sort((a, b) => Number(a.limit) - Number(b.limit))
}

const removeProduct = (index: number) => {
  formData.value.deletedItems.push(formData.value.data[index])
  formData.value.data.splice(index, 1)
}

const addProduct = () => {
  formData.value.data.push({
    product_id: '',
    product: {} as TProduct,
    batch_item_id: '',
    price_per_pack: '',
    batch: {
      palletQuantity: 0,
      packQuantity: 0,
    },
    pack_quantity: '',
    pallet_quantity: <{ value?: string }>{},
    expiry_date: '',
    custom_discount: '',
  } as TOrderItem)
}

const hasAnyProductDiscount = computed(() => {
  return formData.value.data.some(
    (item) => parseNumber(item.custom_discount) > 0
  )
})

const hasGlobalDiscount = computed(() => {
  return parseNumber(formData.value.custom_order_discount) > 0
})

const isProductDiscountDisabled = computed(() => {
  return hasGlobalDiscount.value
})

const isGlobalDiscountDisabled = computed(() => {
  return hasAnyProductDiscount.value
})

const isProductPriceDisabled = (product) => {
  return product?.active_promotions && product.active_promotions.length > 0
}

watch(
  () => formData.value.custom_order_discount,
  (newVal) => {
    if (newVal && parseNumber(newVal) > 0) {
      // Clear all product discounts when global discount is set
      formData.value.data.forEach((item) => {
        item.custom_discount = ''
      })
    }
  }
)

watch(
  () => formData.value.data.map((item) => item.custom_discount),
  (newDiscounts) => {
    const hasProductDiscount = newDiscounts.some(
      (discount) => discount && parseNumber(discount) > 0
    )
    if (hasProductDiscount) {
      // Clear global discount when any product discount is set
      formData.value.custom_order_discount = ''
    }
  },
  { deep: true }
)

const selectProduct = async (event, index) => {
  if (!event) return

  const deletedItemIndex = formData.value.deletedItems.findIndex(
    (item) => item.product_id === event.id
  )

  if (deletedItemIndex !== -1) {
    const restoredItem = formData.value.deletedItems[deletedItemIndex]

    formData.value.data[index] = {
      ...restoredItem,
      product: event,
    }

    formData.value.deletedItems.splice(deletedItemIndex, 1)

    if (!productBatchesLotNumbers.value[event.id]) {
      const data = await productStore.actionGetProductsBatchItems(
        event.id,
        Number(formData.value.user_id)
      )
      productBatchesLotNumbers.value[event.id] = data.data.sort(
        (a, b) => (data[a.status] || 0) - (data[b.status] || 0)
      )
    }

    return
  }

  await selectLotNumber({}, index)
  formData.value.data[index].product_id = event.related_product_id ?? event.id
  formData.value.data[index].product = event

  if (!productBatchesLotNumbers.value[event.id]) {
    const data = await productStore.actionGetProductsBatchItems(
      event.id,
      Number(formData.value.user_id)
    )
    productBatchesLotNumbers.value[event.id] = data.data.sort(
      (a, b) => (data[a.status] || 0) - (data[b.status] || 0)
    )
  }

  if (productBatchesLotNumbers.value[event.id]?.[0]) {
    await selectLotNumber(
      computedProductBatchesLotNumbers.value[event.id]?.[0],
      index
    )
  }

  await nextTick()
  formData.value.data[index].pack_quantity = ''
  formData.value.data[index].pallet_quantity = {}
}

const validateProductSelection = (product, index) => {
  if (!product.id) return false
  if (!formData.value.user_id) {
    errors.value['user_id'] = 'User must be selected'
    setTimeout(() => {
      errors.value['user_id'] = ''
    }, 3000)
    return false
  }

  return true
}

const selectRemoveProduct = async (event, index) => {
  if (!formData.value.user_id) {
    setTimeout(() => {
      errors.value[`order_items.${index}.product_id`] = 'User must be selected'
    })
    return
  }
  formData.value.data[index].product_id = event.id
  formData.value.data[index].product = event
  formData.value.data[index].price = formatCurrency(
    event?.price_per_pack ?? 0,
    true,
    true
  )
}

const updatePackQuantity = (
  selected: { limit: string; name: string },
  index: number,
  quantity: number
) => {
  const e = selected.limit ? selected.limit.toString() : ''
  const batches = formData.value.data
    .map((batch) => {
      if (batch.batch_item_id === formData.value.data[index].batch.id)
        return batch
    })
    .filter((item) => item)

  let pellet = parseNumber(formData.value.data[index].pallet_quantity?.value)
  let oldpack = 0
  if (batches.length > 1) {
    pellet = batches.reduce(
      (a, b) => a + parseNumber(b.pallet_quantity.value),
      0
    )
    oldpack =
      batches.reduce((a, b) => a + parseNumber(b.pack_quantity), 0) -
      parseNumber(formData.value.data[index].pack_quantity)
  }

  if (isNaN(quantity)) return

  errors.value = {} as TOrdersErrors
  if (quantity >= parseNumber(e)) {
    formData.value.data[index].pack_quantity = e
  } else {
    formData.value.data[index].pack_quantity = String(quantity)
    errors.value[`order_items.${index}.pack_quantity`] =
      `max quantity is ${quantity}`
    setTimeout(() => {
      errors.value[`order_items.${index}.pack_quantity`] = ''
    }, 3000)
  }
  let pack = batches.reduce((a, b) => a + parseNumber(b.pack_quantity), 0)

  if (quantity - pack < 0) {
    formData.value.data[index].pack_quantity = ''
    errors.value[`order_items.${index}.pack_quantity`] = `max quantity is 0`
  }
  if (quantity - oldpack > 0 && quantity - pack < 0) {
    formData.value.data[index].pack_quantity = String(quantity - oldpack)
    errors.value[`order_items.${index}.pack_quantity`] =
      `max quantity is ${quantity - oldpack}`
    setTimeout(() => {
      errors.value[`order_items.${index}.pack_quantity`] = ''
    }, 3000)
  }
}

const updatePalletQuantity = (e: { value: string }, index: number) => {
  if (e.value == 'None') {
    formData.value.data[index].pallet_quantity = {}
  } else {
    formData.value.data[index].pallet_quantity = e
  }
  const quantity =
    formData.value.data[index].batch.quantity -
    formData.value.data[index].batch.product.packs_quantity_per_pallet *
      Number(formData.value.data[index].pallet_quantity.value ?? 0)
  if (quantity < Number(formData.value.data[index].pack_quantity)) {
    formData.value.data[index].pack_quantity = String(quantity)
  }
}

const calculatePallets = (
  pack: number,
  pallet: number,
  packs_quantity_per_pallet: number,
  type: boolean
): number | string => {
  const count =
    parseNumber(pallet) * packs_quantity_per_pallet + parseNumber(pack)
  if (!count) {
    return ''
  }
  if (!type) {
    return count
  }

  const val = parseNumber(count) / parseNumber(packs_quantity_per_pallet)
  return val > 0 && val < 1 ? 1 : Math.ceil(val)
}

const selectLotNumber = async (event, index) => {
  if (!event) {
    formData.value.data[index].pack_quantity = ''
    formData.value.data[index].pallet_quantity = {}
    formData.value.data[index].price_per_pack = ''
    formData.value.data[index].expiry_date = ''
    formData.value.data[index].batch_item_id = ''
    formData.value.data[index].batch = {
      palletQuantity: 0,
      packQuantity: 0,
      quantity: 0,
      id: '',
      product: {} as TProduct,
    }
    return
  }
  formData.value.data[index].price_per_pack = formatCurrency(
    event?.price_per_pack ?? 0,
    true,
    true
  )
  formData.value.data[index].batch_item_id = event.id
  formData.value.data[index].batch = event
  formData.value.data[index].expiry_date = event.expiry_date

  formData.value.data[index].pack_quantity = ''
  formData.value.data[index].pallet_quantity = {}
}

const selectCustomer = async (event) => {
  if (event && Object.keys(event).length === 0) {
    formData.value.user_id = ''
    formData.value.user = {} as TCustomer
    formData.value.order_shipping_cost = ''
    formData.value.order_shipping_name = ''
    formData.value.order_address = ''
    formData.value.user_id = event.id
    formData.value.data = []
    productBatchesLotNumbers.value = {}
    errors.value = {} as TOrdersErrors
    await nextTick()
    addProduct()
    return
  }
  formData.value.user_id = event.id
  formData.value.user = event
  formData.value.order_shipping_cost = formatCurrency(
    Number(event.shipping?.data?.cost ?? 0),
    true,
    true
  )
  formData.value.order_shipping_name = event.shipping?.data?.name
  formData.value.order_address = event.address
  formData.value.data = []
  productBatchesLotNumbers.value = {}
  errors.value = {} as TOrdersErrors
  await nextTick()
  addProduct()
}

const compRelatedProductsQuantityForTheSameProducts = () => {
  const newRelatedProducts = [] as {
    product_id: number
    relatedProducts: {
      related_product: TRelatedProduct
      quantity: number
      packsQuantityPerPallet: number
      type: number
    }[]
  }[]

  formData.value.data.forEach((item) => {
    if (!(item.product as TProduct).relatedProducts?.data?.length) return

    const product_id = item.product.id

    const itemTotalQuantity =
      parseNumber(item.pallet_quantity?.value) *
        parseNumber((item.product as TProduct).packs_quantity_per_pallet) +
      parseNumber(item.pack_quantity)

    let productGroup = newRelatedProducts.find(
      (p) => p.product_id === product_id
    )

    if (!productGroup) {
      productGroup = {
        product_id,
        relatedProducts: [],
      }
      newRelatedProducts.push(productGroup)
    }

    ;(item.product as TProduct).relatedProducts.data.forEach((rel) => {
      const existingRelated = productGroup.relatedProducts.find(
        (existing) =>
          existing.related_product.id === rel.related_product.id &&
          existing.type === rel.related_product.related_with
      )

      if (existingRelated) {
        existingRelated.quantity += itemTotalQuantity
      } else {
        productGroup.relatedProducts.push({
          related_product: rel.related_product,
          quantity: itemTotalQuantity,
          packsQuantityPerPallet: (item.product as TProduct)
            .packs_quantity_per_pallet,
          type: rel.related_product.related_with,
        })
      }
    })
  })

  const totalRelatedProductsPrice = newRelatedProducts.reduce(
    (total, product) => {
      return (
        total +
        product.relatedProducts.reduce((productTotal, rel) => {
          const quantity = parseNumber(rel.quantity)
          const price = parseNumber(rel.related_product.price)
          const packsPerPallet = parseNumber(rel.packsQuantityPerPallet)

          if (rel.type === 1) {
            const numberOfPallets = Math.ceil(quantity / packsPerPallet)
            return productTotal + numberOfPallets * price
          } else {
            return productTotal + quantity * price
          }
        }, 0)
      )
    },
    0
  )

  return {
    newRelatedProducts,
    totalRelatedProductsPrice,
  }
}

const compPalletQuantity = computed(() => {
  return formData.value.data.map((item) => {
    const batches = formData.value.data
      .map((batch) => {
        if (batch?.batch_item_id === item.batch?.id) return batch
      })
      .filter((item) => item)
    let length = parseNumber(
      item.batch?.palletQuantity || item.original_pallet_quantity?.value
    )
    if (batches.length > 1) {
      const sum = batches.reduce(
        (a, b) => a + Number(b.pallet_quantity?.value ?? 0),
        0
      )
      length = length - sum + Number(item.pallet_quantity?.value ?? 0)
    }
    const result = []
    for (let i = 1; i <= length; i++) {
      result.push({ value: i })
    }
    return result
  })
})

const computedProductBatchesLotNumbers = computed(() => {
  const selectedLotNumberStockCombinations = new Set(
    formData.value.data
      .filter((item) => item.batch?.lot_number && item.batch?.stock)
      .map((item) => `${item.batch.lot_number}_${item.batch.stock?.id}`)
  )

  return Object.fromEntries(
    Object.entries(productBatchesLotNumbers.value).map(([key, value]) => {
      const seenCombinations = new Set()

      return [
        key,
        value
          .filter((item) => {
            const uniqueKey = `${item.stock?.type == 2 ? `${item.lot_number} F_${item.stock?.id}` : `${item.lot_number}_${item.stock?.id || 'no_stock'}`}`

            if (selectedLotNumberStockCombinations.has(uniqueKey)) {
              return false
            }

            if (!seenCombinations.has(uniqueKey)) {
              seenCombinations.add(uniqueKey)
              return true
            }

            return false
          })
          .map((item) => {
            return {
              ...item,
              lot_number:
                item.stock?.type == 2
                  ? item.lot_number + ' F'
                  : item.lot_number,
            }
          }),
      ]
    })
  )
})

const comSubtotalWithoutTotalDiscount = computed(() => {
  const total = formData.value.data.reduce((total, item) => {
    const packsPerPallet = parseNumber(
      (item.product as TProduct)?.packs_quantity_per_pallet
    )
    const palletQty = Number(
      item.pallet_quantity?.value && item.pallet_quantity?.value != 'None'
        ? item.pallet_quantity?.value
        : 0
    )
    const packQty = parseNumber(item.pack_quantity)
    const totalPacks = packsPerPallet * palletQty + packQty
    const basePerPack = parseNumber(item.price_per_pack)
    const promotionType = (item.product as TProduct)?.active_promotions?.length
      ? (item.product as TProduct).active_promotions[0].pivot.type
      : null
    const promotionAmount = (item.product as TProduct)?.active_promotions
      ?.length
      ? parseNumber(
          (item.product as TProduct).active_promotions[0].pivot.amount
        )
      : 0
    const promotionalPricePerPack = calculatePromotionalPricePerPack(
      (item.product as TProduct).price_per_pack,
      promotionType,
      promotionAmount
    )
    const pricePerPack = !promotionType
      ? basePerPack
      : basePerPack < promotionalPricePerPack
        ? basePerPack
        : promotionalPricePerPack
    const customItemDiscount = parseNumber(item.custom_discount) || 0
    const discountedPricePerPack = pricePerPack * (1 - customItemDiscount / 100)
    const itemTotal =
      totalPacks *
      (discountedPricePerPack > 0 ? discountedPricePerPack : pricePerPack)

    return total + itemTotal
  }, 0)

  return total
})

const compSubtotal = computed(() => {
  const totalDiscountPercent =
    parseNumber(formData.value.custom_order_discount) || 0

  const totalDiscount =
    (comSubtotalWithoutTotalDiscount.value * totalDiscountPercent) / 100

  return (
    comSubtotalWithoutTotalDiscount.value -
    totalDiscount +
    compRelatedProductsQuantityForTheSameProducts().totalRelatedProductsPrice
  )
})

const totalPromotion = computed(() => {
  return formData.value.data.reduce((total, item) => {
    const product = item.product as TProduct

    if (!product?.active_promotions?.length) {
      return total
    }

    const packPerPallet = parseNumber(product.packs_quantity_per_pallet)
    const palletQuantity = parseNumber(item.pallet_quantity?.value)
    const packQuantity = parseNumber(item.pack_quantity)
    const totalQuantity = palletQuantity * packPerPallet + packQuantity

    if (totalQuantity === 0) {
      return total
    }

    const originalPricePerPack =
      parseNumber(product.price_per_pack) ||
      parseNumber(item.batch?.original_price_per_pack) ||
      parseNumber(item.batch?.product?.price_per_pack)

    const promotionType = product.active_promotions[0]?.pivot?.type
    const promotionAmount = parseNumber(
      product.active_promotions[0]?.pivot?.amount
    )
    const promotionalPricePerPack = calculatePromotionalPricePerPack(
      product.price_per_pack,
      promotionType,
      promotionAmount
    )

    if (parseNumber(item.price_per_pack) < promotionalPricePerPack) {
      return total
    }

    const promotionDiscount = product.active_promotions.reduce(
      (promoTotal, promotion) => {
        const promotionAmount = parseNumber(promotion.pivot.amount)
        const promotionType = promotion.pivot.type

        if (promotionType === 1) {
          const discountPerPack = (originalPricePerPack * promotionAmount) / 100
          return promoTotal + discountPerPack * totalQuantity
        } else if (promotionType === 2) {
          const discountPerPack = promotionAmount
          return promoTotal + discountPerPack * totalQuantity
        }

        return promoTotal
      },
      0
    )

    return total + promotionDiscount
  }, 0)
})

const totalShippingCost = computed(() => {
  const totalShipping =
    compRelatedProductsQuantityForTheSameProducts().newRelatedProducts.reduce(
      (total, product) => {
        return (
          total +
          product.relatedProducts.reduce((productTotal, rel) => {
            const quantity = parseNumber(rel.quantity)
            return (
              Math.ceil(quantity / rel.packsQuantityPerPallet) *
              parseNumber(formData.value.order_shipping_cost)
            )
          }, 0)
        )
      },
      0
    )

  const additionalShippingCost = formData.value.data
    .filter(
      (item) =>
        !compRelatedProductsQuantityForTheSameProducts()
          .newRelatedProducts.map((product) => product.product_id)
          .includes(Number(item.product_id))
    )
    .reduce((total, item) => {
      const quantity =
        parseNumber(item.pallet_quantity?.value) *
          parseNumber((item.product as TProduct).packs_quantity_per_pallet) +
        parseNumber(item.pack_quantity)
      if (!quantity) return total
      return (
        total +
        Math.ceil(
          quantity /
            parseNumber((item.product as TProduct).packs_quantity_per_pallet)
        ) *
          parseNumber(formData.value.order_shipping_cost)
      )
    }, 0)

  return formData.value.user?.shipping?.data?.type === SHIPPING_TYPE[0].value
    ? formatCurrency(formData.value.order_shipping_cost, true, true)
    : parseEuroCurrency(totalShipping + additionalShippingCost)
})

const compProducts = computed(() => {
  let product = productBatches.value?.data?.length
    ? [...productBatches.value?.data]
    : []

  return [...product]
})

const submit = async () => {
  if (
    !formData.value.data.length ||
    formData.value.data.every((item) => !item.product_id)
  ) {
    notificationStore.addNotification({
      id: new Date().getTime(),
      notification: 'Please add at least one product to the order.',
      type: 'warning',
    })
    return
  }

  isSubmitting.value = true
  try {
    errors.value = {} as TOrdersErrors
    const orderItems = formData.value.data.filter((item) => !item.refund)

    const params = {
      user_id: formData.value.user_id,
      order_address: formData.value.order_address,
      order_shipping_cost: parseEuroCurrency(
        formData.value.order_shipping_cost
      ),
      order_date: formData.value.order_date,
      custom_order_discount: formData.value.custom_order_discount,
      deleted_items: formData.value.deletedItems,
      order_items: orderItems.map((item) => ({
        ...(!(item.product as TProduct).related_product_id && {
          product_id: item.product_id,
        }),
        ...(item.batch_item_id && { batch_item_id: item.batch_item_id }),
        ...(item.price_per_pack && {
          price_per_pack: parseEuroCurrency(item.price_per_pack),
        }),
        ...(item.pack_quantity && { pack_quantity: item.pack_quantity }),
        ...(item.pallet_quantity &&
          item.pallet_quantity?.value != 'None' && {
            pallet_quantity: item.pallet_quantity?.value,
          }),
        ...(item.custom_discount && {
          custom_discount: parseNumber(item.custom_discount),
        }),
      })),
      // order_related_product: formData.value.data.map((item) => ({
      //     ...((item.product as TProduct).related_product_id && {related_product_id: (item.product as TProduct).related_product_id}),
      //     ...(item.price && {price: item.price}),
      //     ...(item.quantity && {quantity: item.quantity}),
      // }))
      // refund_related_product: refundRelatedProduct.map((item) => ({
      //   ...(item.product_id && { product_id: item.product_id }),
      //   ...(item.quantity && { quantity: item.quantity }),
      //   ...(item.price && { price: item.price }),
      // })),
    }
    const data = await ordersStore.actionUpdateOrder(
      Number(route.params.id),
      params
    )
    if (data.response?.data?.status !== 400) {
      modalStore.setIsFormDirty(false)
      queryClient.invalidateQueries({
        queryKey: ['payments-sell'],
      })
      queryClient.invalidateQueries({
        queryKey: ['customers'],
      })
      queryClient.invalidateQueries({
        queryKey: ['transfer'],
      })
      queryClient.invalidateQueries({ queryKey: ['transfer-status'] })
      router.push('/admin/sell/orders')
    } else {
      Object.keys(data?.response?.data?.errors).forEach((item, index) => {
        if (index == 0) {
          errors.value[item] = data.response.data.errors[item][0]
            .replace(/order_items\.\d+\.pack_quantity/g, 'pack quantity')
            .replace(/order_items\.\d+\.pallet_quantity/g, 'pallet quantity')
            .replace(/order_items\.\d+\.batch_item_id/g, 'lot number')
            .replace('user id', 'user')
            .replace(/order_items\.\d+\.product_id/g, 'product')
            .replace(/order_items\.\d+\.expiry_date/g, 'expiry date')
            .replace(/order_items\.\d+\.cost/g, 'cost')
            .replace(/order_items\.\d+\.custom_discount/g, 'discount')
            .replace(/order_items\.\d+\.price_per_pack/g, 'price per pack')
        }
      })
    }
  } catch (error) {
    notificationStore.addNotification({
      id: new Date().getTime(),
      type: 'warning',
      notification: 'Something went wrong.',
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  notificationStore.setLoading(true)
  ordersStore.$reset()
  filters.value['delivered'].per_page = 99999
  filters.value['delivered']['include[]'] = ['orderItemProduct']
  customerStore.$reset()
  await ordersStore.actionGetOrder(Number(route.params.id))
  await customerStore.actionGetCustomers({
    'include[]': ['shipping'],
    per_page: 99999,
  })
  await productStore.actionGetProductsBatches()
  await productStore.actionGetRefundProductList()
  // await relatedStore.actionGetRelatedProductsForSale()
  await ordersStore.actionGetOrders('delivered')
  for (const item of order.value?.orderItems?.data) {
    if (!productBatchesLotNumbers.value[item.product_id]) {
      const data = await productStore.actionGetProductsBatchItems(
        Number(item.product_id),
        Number(order.value.user_id)
      )
      productBatchesLotNumbers.value[item.product_id] = data?.data
    }
  }
  setTimeout(() => {
    const orderData = order.value.orderItems?.data.map((items) => {
      if (
        !productBatchesLotNumbers.value[items.product_id]?.find(
          (lot) =>
            lot.lot_number == items.lot_number &&
            lot.stock?.id == items.batchItem.data.stock?.id
        )
      ) {
        productBatchesLotNumbers.value[items.product_id].push({
          id: items.batch_item_id,
          // lot_number: items.lot_number,
          lot_number:
            items.batchItem.data.stock?.type == 2
              ? items.lot_number + ' F'
              : items.lot_number,
          palletQuantity: Number(items.pallet_quantity),
          packQuantity: Number(items.pack_quantity),
          quantity: Number(items.quantity),
          expiry_date: items.batchItem.data.expiry_date,
          // price_per_pack: items.price_per_pack,
          price_per_pack: formatCurrency(
            items?.price_per_pack ?? 0,
            true,
            true
          ),
          product: items.batchItem.data.product.data as TProduct,
        })
      } else {
        let index = productBatchesLotNumbers.value[items.product_id]?.findIndex(
          (lot) =>
            lot.lot_number == items.lot_number &&
            lot.stock?.id == items.batchItem.data.stock?.id
        )
        let batch = productBatchesLotNumbers.value[items.product_id][index]
        productBatchesLotNumbers.value[items.product_id][index] = {
          ...batch,
          palletQuantity:
            Number(items.pallet_quantity) + Number(batch.palletQuantity),
          packQuantity:
            Number(items.pack_quantity) + Number(batch.packQuantity),
        }
      }

      return {
        id: items.id,
        is_original: true,
        product_id: items.product_id,
        batch_item_id: items.batch_item_id,
        // price_per_pack: items.price_per_pack,
        price_per_pack: formatCurrency(items?.price_per_pack ?? 0, true, true),
        // lot_number: items.lot_number,
        lot_number:
          items.batchItem.data.stock?.type == 2
            ? items.lot_number + ' F'
            : items.lot_number,
        product: {
          ...items.batchItem.data.product.data,
          relatedProducts: {
            data: items.batchItem.data.product.data.related_products,
          },
        },
        batch: {
          id: items.batch_item_id,
          quantity: items.batchItem.data.quantity + Number(items.quantity),
          reserved_quantity: items.batchItem.data.reserved_quantity,
          product: items.batchItem.data.product.data,
          palletQuantity: productBatchesLotNumbers.value[
            items.product_id
          ]?.find((lot) => lot.id == items.batch_item_id)?.palletQuantity,
          packQuantity: productBatchesLotNumbers.value[items.product_id]?.find(
            (lot) => lot.id == items.batch_item_id
          )?.packQuantity,
          stock: items.batchItem.data.stock,
          // lot_number: items.lot_number,
          lot_number:
            items.batchItem.data.stock?.type == 2
              ? items.lot_number + ' F'
              : items.lot_number,
        },
        pack_quantity: items.pack_quantity
          ? String(items.pack_quantity)
          : undefined,
        pallet_quantity: items.pallet_quantity
          ? { value: String(items.pallet_quantity) }
          : undefined,
        original_pallet_quantity: items.pallet_quantity
          ? { value: String(items.pallet_quantity) }
          : undefined,
        expiry_date: items.expire_date,
        custom_discount:
          parseNumber(items.custom_discount) === 0
            ? ''
            : parseNumber(items.custom_discount).toString(),
      }
    })

    const refundOrder =
      order.value.temporaryOrderRefundForRelatedProduct?.data.map((items) => {
        return {
          product: items.product.data,
          product_id: items.product.data.id,
          price: items.price,
          quantity: items.quantity,
          refund: true,
        }
      })

    formData.value = {
      order_address: order.value.address,
      order_date: order.value.order_date,
      custom_order_discount:
        parseNumber(order.value.custom_discount) === 0
          ? ''
          : parseNumber(order.value.custom_discount).toString(),
      user_id: String(order.value.user_id),
      order_shipping_cost: formatCurrency(
        order.value.shipping_cost,
        true,
        true
      ),
      total_shipping_cost: formatCurrency(
        order.value.total_shipping_cost,
        true,
        true
      ),
      // total_shipping_cost: parseEuroCurrency(
      //   order.value.total_shipping_cost
      // ).toString(),
      order_shipping_name: customers.value.data.find(
        (c) => c.id == order.value.user_id
      )?.shipping?.data?.name,
      user: customers.value.data.find((c) => c.id == order.value.user_id),
      // @ts-ignore
      data: [...orderData, ...refundOrder],
      deletedItems: [],
    }
    notificationStore.setLoading(false)
  }, 500)
})

onUnmounted(() => {
  notificationStore.setLoading(false)
})
</script>

<template>
  <div class="new-order flex justify-center">
    <div class="form-content w-full max-w-7xl">
      <h1 class="uppercase">{{ $t('EDIT_order') }}</h1>
      <div class="form flex flex-col gap-[50px]">
        <div class="content flex flex-col">
          <div class="main">
            <SearchSelect
              @click="errors = {} as TOrdersErrors"
              :error="errors.user_id"
              :placeholder="`${$t('Name')} *`"
              :data="customers.data"
              :show-key="'company'"
              :none="false"
              :selected="formData.user"
              @select="selectCustomer"
              :is-dirty="true"
            />
            <UIInput
              :model-value="
                formData?.order_shipping_cost
                  ? `${formData?.order_shipping_name}/${formatCurrency(parseEuroCurrency(formData?.order_shipping_cost))}`
                  : ''
              "
              :error="errors.order_shipping_cost"
              @update:model-value="errors = {} as TOrdersErrors"
              :disabled="true"
              :placeholder="`${$t('Shipping_Cost')} *`"
              :is-dirty="true"
            />
            <UIInput
              v-model="formData.order_address"
              :error="errors.order_address"
              @update:model-value="errors = {} as TOrdersErrors"
              :placeholder="`${$t('Address')} *`"
              :is-dirty="true"
            />
            <UIInputDate
              @click="errors = {} as TOrdersErrors"
              :error="errors.order_date"
              :placeholder="`${$t('Order_date')} *`"
              v-model="formData.order_date"
              :is-dirty="true"
            />
            <UIInput
              @update:model-value="errors = {} as TOrdersErrors"
              symbol="%"
              :placeholder="`${$t('Discount')}`"
              :error="errors.custom_order_discount"
              v-model="formData.custom_order_discount"
              :disabled="isGlobalDiscountDisabled"
              :is-dirty="true"
            />
          </div>
          <template v-for="(form, index) in formData.data">
            <div v-if="!form?.refund" class="products">
              <SearchSelect
                :showFromSelected="true"
                :placeholder="`${$t('Choose_product')} *`"
                :error="errors[`order_items.${index}.product_id`]"
                @click="errors = {} as TOrdersErrors"
                :data="compProducts"
                :none="false"
                :selected="form.product"
                @select="selectProduct($event, index)"
                :show-key="'name'"
                :is-dirty="true"
                :validate="
                  (product) => validateProductSelection(product, index)
                "
              />
              <SingleSelect
                :showFromSelected="true"
                :placeholder="`${$t('QNT__(Pallet)')} *`"
                :error="errors[`order_items.${index}.pallet_quantity`]"
                @click="errors = {} as TOrdersErrors"
                :data="compPalletQuantity?.[index]"
                :selected="form.pallet_quantity"
                @select="updatePalletQuantity($event, index)"
                :show-key="'value'"
                :selected-key="'value'"
                :is-dirty="true"
              />
              <SingleSelectCreatable
                :error="errors[`order_items.${index}.pack_quantity`]"
                selectedKey="limit"
                :selected="{
                  limit: form.pack_quantity,
                  name: form.pack_quantity,
                }"
                @select="
                  updatePackQuantity(
                    $event,
                    index,
                    form.pallet_quantity?.value
                      ? parseNumber(form.batch.quantity) -
                          parseNumber(form.pallet_quantity.value) *
                            parseNumber(
                              (form.product as TProduct)
                                ?.packs_quantity_per_pallet
                            )
                      : parseNumber(form.batch.quantity)
                  )
                "
                :max-value="
                  form.pallet_quantity?.value
                    ? String(
                        parseNumber(form.batch.quantity) -
                          parseNumber(form.pallet_quantity.value) *
                            parseNumber(
                              (form.product as TProduct)
                                ?.packs_quantity_per_pallet
                            )
                      )
                    : String(parseNumber(form.batch.quantity))
                "
                :placeholder="`${$t('QNT__(Pack)')} *`"
                :data="getPacks(form.product as TProduct)"
                :is-integer="true"
                :is-dirty="true"
              />
              <UIInput
                v-model="form.price_per_pack"
                :error="errors[`order_items.${index}.price_per_pack`]"
                symbol="€"
                @update:model-value="errors = {} as TOrdersErrors"
                :placeholder="`${$t('Price_per_Pack')} *`"
                :disabled="isProductPriceDisabled(form.product)"
                :is-dirty="true"
              />
              <SingleSelect
                :showFromSelected="true"
                :placeholder="`${$t('Lot_Number')} *`"
                :error="errors[`order_items.${index}.batch_item_id`]"
                @click="errors = {} as TOrdersErrors"
                :data="computedProductBatchesLotNumbers[form?.product_id]"
                :selected="form.batch"
                @select="selectLotNumber($event, index)"
                :show-key="'lot_number'"
                :is-dirty="true"
                :disabled="form.is_original"
              />
              <UIInputDate
                :disabled="true"
                :placeholder="`${$t('Expire_Date')} *`"
                v-model="form.expiry_date"
                :is-dirty="true"
              />
              <UIInput
                @update:model-value="errors = {} as TOrdersErrors"
                symbol="%"
                :placeholder="`${$t('Discount')}`"
                :error="errors[`order_items.${index}.custom_discount`]"
                v-model="form.custom_discount"
                :disabled="isProductDiscountDisabled"
                :is-dirty="true"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeProduct(Number(index))"
              >
                <IconMinus />
              </Button>

              <div
                class="col-span-2 grid grid-cols-[1fr_152px] gap-4 pb-1"
                v-if="
                  compRelatedProductsQuantityForTheSameProducts().newRelatedProducts.find(
                    (p) =>
                      p.product_id === form.product_id &&
                      formData.data
                        .filter((item) => item.product_id === form.product_id)
                        .indexOf(form) ===
                        formData.data.filter(
                          (item) => item.product_id === form.product_id
                        ).length -
                          1
                  )?.relatedProducts.length
                "
              >
                <template
                  v-for="rel in compRelatedProductsQuantityForTheSameProducts().newRelatedProducts.find(
                    (p) => p.product_id === form.product_id
                  )?.relatedProducts"
                >
                  <UIInput
                    :model-value="rel.related_product?.name"
                    :disabled="true"
                    :placeholder="`${$t('Related_product')}`"
                    :is-dirty="true"
                  />
                  <UIInput
                    :model-value="
                      rel.type === 1
                        ? Math.ceil(rel.quantity / rel.packsQuantityPerPallet)
                        : rel.quantity
                    "
                    :disabled="true"
                    :placeholder="`${$t('Quantity')}`"
                    :is-dirty="true"
                  />
                </template>
              </div>
            </div>
          </template>
          <Button
            variant="ghost"
            class="mt-16 h-8 self-start px-2"
            @click="addProduct"
          >
            <IconPlus20 />
            <span class="body-text-2"> {{ $t('Add_product') }}</span>
          </Button>
          <template v-for="(form, index) in formData.data">
            <div v-if="form?.refund" class="products">
              <SearchSelect
                :showFromSelected="true"
                :placeholder="`${$t('Choose_product')} *`"
                :error="errors[`order_items.${index}.product_id`]"
                @click="errors = {} as TOrdersErrors"
                :data="refundProductList.data"
                :none="false"
                :selected="form.product"
                @select="selectRemoveProduct($event, index)"
                :show-key="'name'"
                :is-dirty="true"
              />
              <UIInput
                v-model="form.quantity"
                :error="errors[`order_items.${index}.quantity`]"
                input-type="number"
                :limit="true"
                :placeholder="`${$t('Quantity')} *`"
                :is-dirty="true"
              />
              <UIInput
                v-model="form.price"
                :error="errors[`order_items.${index}.price`]"
                :placeholder="`${$t('Price')} *`"
                @update:model-value="errors = {} as TOrdersErrors"
                :is-dirty="true"
              />
              <Button
                size="icon"
                variant="ghost"
                class="h-[42px] w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeProduct(Number(index))"
              >
                <IconMinus />
              </Button>
            </div>
          </template>

          <div class="ship-sub flex flex-col gap-2">
            <div class="flex justify-between">
              <h3>{{ $t('Shipping_Cost') }}:</h3>
              <div class="relative flex">
                <UIInput
                  v-model="formData.order_shipping_cost"
                  symbol="€"
                  symbolClass="-translate-x-2"
                  class="min-w-[110px]"
                  :is-dirty="true"
                />
                <Pencil
                  :size="18"
                  class="pointer-events-none absolute end-1 top-1.5 text-[var(--neutral-400)]"
                />
              </div>
            </div>
            <div class="flex justify-between pt-4">
              <h3>{{ $t('Subtotal') }}:</h3>
              <p class="body-text">
                {{ formatCurrency(compSubtotal) }}
              </p>
            </div>
            <div class="flex justify-between">
              <h3>{{ $t('Promotion') }}:</h3>
              <p class="body-text">-{{ formatCurrency(totalPromotion) }}</p>
            </div>
            <div class="flex justify-between">
              <h3>{{ $t('Total_Shipping_Cost') }}:</h3>
              <p class="body-text">
                {{ formatCurrency(totalShippingCost) }}
              </p>
            </div>
            <div class="flex justify-between">
              <h3>{{ $t('Order_Total_Price') }}:</h3>
              <p class="body-text">
                {{
                  formatCurrency(
                    Math.round(
                      parseEuroCurrency(compSubtotal) +
                        parseEuroCurrency(totalShippingCost)
                    )
                  )
                }}
              </p>
            </div>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton @click="submit" :disabled="isSubmitting">{{
            $t('Edit')
          }}</UIButton>
          <UIButton type="button" types="cancel" @click="$router.go(-1)"
            >{{ $t('Go_Back') }}
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-plus {
  margin-bottom: 10px;

  svg {
    width: 20px;
  }
}

.new-order {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    .form {
      .content {
        .main {
          display: grid;
          grid-template-columns: 1fr 256px 243px 166px 136px;
          gap: 16px;
          padding: 12px 32px;
          background: var(--neutral-200);
          border-radius: 4px;
          margin-top: 21px;
          margin-bottom: 24px;

          .select-content,
          label {
            background: var(--white);
            border-radius: 4px;
          }
        }

        .products {
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 1fr 152px 146px 150px 152px 150px 99px 24px;
          gap: 12px 16px;
        }
      }
    }
  }
}

.ship-sub {
  margin-top: 16px;
  max-width: 280px;

  label {
    max-width: 100px;
    padding: 2px 9px;

    input {
      width: 100%;
      border: 1px solid var(--neutral-200);
      border-radius: 4px;
    }
  }
}
</style>
