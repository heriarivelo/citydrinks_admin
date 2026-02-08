<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import IconMinus from '@/components/icons/IconMinus.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { Button } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import UIRadioInput from '@/components/ui/inputs/UIRadioInput.vue'
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
import { useRefundsStore } from '@/modules/sell/refund/store/refund.ts'
import { SHIPPING_TYPE } from '@/modules/stocks/constants'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes.ts'
import { TRelatedProduct } from '@/modules/others/relatedProduct/store/types/relatedTypes'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { useModalStore } from '@/store/modal'
import { formatDate } from '@/utils/dateUtils.ts'
import { Pencil } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useNotificationStore } from '@/store/notification'
import { TStock } from '@/modules/stocks/store/types/stockTypes'

const queryClient = useQueryClient()
const customerStore = useCustomerStore()
const productStore = useProductStore()
const modalStore = useModalStore()
const ordersStore = useOrdersStore()
const refundsStore = useRefundsStore()
const stockStore = useStockStore()
const { customers } = storeToRefs(customerStore)
const notificationStore = useNotificationStore()

const { productBatches, refundProductList } = storeToRefs(productStore)
const { stocks } = storeToRefs(stockStore)
const { filters, orders } = storeToRefs(ordersStore)
const router = useRouter()
const errors = ref({} as TOrdersErrors)
const refundErrors = ref({} as TOrdersErrors)
const openRefund = ref(false)
const isSubmitting = ref(false)

const productBatchesLotNumbers = ref(
  {} as {
    [key: string]: [{ id: string; lot_number: string; stock: TStock }]
  }
)

const refundFormData = ref({
  stock: {
    id: '',
  },
  order: {
    user_id: '',
    id: '',
    orderItems: { data: [] },
  },
  order_date: '',
  refund_to_balance: 0,
  data: [
    {
      product: {} as TProduct,
      quantity: '',
      cost: '',
    },
  ],
})

const formData = ref({
  order_address: '',
  order_date: '',
  custom_order_discount: '',
  user_id: '',
  order_shipping_cost: '',
  order_shipping_name: '',
  user: {} as TCustomer,
  data: [
    {
      product_id: '',
      product: {} as TProduct,
      batch_item_id: '',
      price_per_pack: '',
      batch: {
        palletQuantity: 0,
        quantity: 0,
        id: '',
        packQuantity: 0,
        product: {} as TProduct,
      },
      pack_quantity: '',
      quantity: '',
      price: '',
      pallet_quantity: <{ value?: string }>{},
      expiry_date: '',
      custom_discount: '',
    },
  ] as TOrderItem[],
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
      quantity: 0,
      id: '',
      product: {} as TProduct,
    },
    quantity: '',
    price: '',
    pack_quantity: '',
    pallet_quantity: {},
    expiry_date: '',
    custom_discount: '',
  })
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

const addRefundProduct = () => {
  refundFormData.value.data.push({
    product: {} as TProduct,
    quantity: '',
    cost: '',
  })
}

const removeRefundProduct = (index: number) => {
  refundFormData.value.data.splice(index, 1)
}

const selectProduct = async (event, index) => {
  if (!event.id) return
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
      parseNumber(formData.value.data[index].pallet_quantity.value)
  if (quantity < parseNumber(formData.value.data[index].pack_quantity)) {
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

  const val = Number(count) / Number(packs_quantity_per_pallet)
  return val > 0 && val < 1 ? 1 : Math.round(val)
}

const selectLotNumber = async (event, index) => {
  if (!event?.id) {
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
        if (batch.batch_item_id === item.batch?.id) return batch
      })
      .filter((item) => item)
    let length = item.batch?.palletQuantity
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
  const batchIds = formData.value.data
    .map((batch) => {
      return batch.batch_item_id
    })
    .filter((item) => item)

  return Object.fromEntries(
    Object.entries(productBatchesLotNumbers.value).map(([key, value]) => {
      return [
        key,
        value
          .filter((item) => {
            return !batchIds.includes(item.id)
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

const refundTotalPrice = computed(() => {
  return refundFormData.value.data.reduce((total, item) => {
    const totalPacks = Number(item.quantity)

    // Get the price per pack and discounts
    const pricePerPack = Number(item.product.price_per_pack) || 0

    // Calculate the total price for this item
    const itemTotal = totalPacks * pricePerPack

    // Add the item's total price to the order total
    return total + itemTotal
  }, 0)
})

const totalBalance = computed(() => {
  if (refundFormData.value?.refund_to_balance == 0) {
    return (
      parseNumber(formData.value.user?.balance) -
      (compSubtotal.value +
        parseEuroCurrency(formData.value.order_shipping_cost))
    )
  }
  return (
    parseNumber(formData.value.user?.balance) +
    refundTotalPrice.value -
    (compSubtotal.value + parseEuroCurrency(formData.value.order_shipping_cost))
  )
})

// const compProduct = computed(() => {
//   return refundFormData.value?.order?.orderItems?.data.map((item) => {
//     return {
//       ...item.batch_item.product,
//       quantity: item.quantity,
//       price_per_pack: item.price_per_pack,
//     }
//   })
// })

const compProducts = computed(() => {
  let product = productBatches.value?.data?.length
    ? [...productBatches.value?.data]
    : []

  return [...product]
})

const updateQuantity = (e: string, index: number) => {
  const quantity = refundFormData.value.data[index].product.quantity
  refundErrors.value = {} as TOrdersErrors
  if (Number(quantity) >= Number(e)) {
    refundFormData.value.data[index].quantity = e
  } else {
    refundFormData.value.data[index].quantity = String(quantity)
    refundErrors.value[`products.${index}.quantity`] =
      `max quantity is ${quantity}`
  }
}

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
  errors.value = {} as TOrdersErrors
  refundErrors.value = {} as TOrdersErrors
  try {
    const orderItems = formData.value.data.filter((item) => !item.refund)
    // const refundRelatedProduct = formData.value.data.filter((item) => item.refund)
    const orderParams = {
      user_id: formData.value.user_id,
      order_address: formData.value.order_address,
      order_shipping_cost: parseEuroCurrency(
        formData.value.order_shipping_cost
      ),
      order_date: formData.value.order_date,
      custom_order_discount: formData.value.custom_order_discount,
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
          custom_discount:
            parseNumber(item.custom_discount) === 0
              ? ''
              : parseNumber(item.custom_discount).toString(),
        }),
      })),
      // refund_related_product: refundRelatedProduct.map((item) => ({
      //   ...(item.product_id && { product_id: item.product_id }),
      //   ...(item.quantity && { quantity: item.quantity }),
      //   ...(item.price && { price: item.price }),
      // })),
    }
    // let refundData

    // if (openRefund.value) {
    //   const refundParams = {
    //     user_id: refundFormData.value.order.user_id,
    //     stock_id: refundFormData.value.stock.id,
    //     order_id: refundFormData.value.order.id,
    //     refund_to_balance: refundFormData.value.refund_to_balance,
    //     refund_date: refundFormData.value.order_date,
    //     products: refundFormData.value.data.map((item) => {
    //       return {
    //         id: item.product.id,
    //         quantity: item.quantity,
    //         cost: parseEuroCurrency(item.cost),
    //       }
    //     }),
    //   }
    //   refundData = await refundsStore.actionCreateRefund(refundParams)
    // }
    const orderData = await ordersStore.actionCreateOrder(orderParams)

    if (orderData.status == 201 && !openRefund.value) {
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
      Object.keys(orderData.response.data.errors).forEach((item, index) => {
        if (index == 0) {
          errors.value[item] = orderData.response.data.errors[item][0]
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

  // if (
  //   orderData.status == 201 &&
  //   (!openRefund.value || refundData?.status == 201)
  // ) {
  //   modalStore.setIsFormDirty(false)
  //   router.push('/admin/sell/orders')
  // } else {
  //   Object.keys(orderData.response.data.errors).forEach((item, index) => {
  //     if (index == 0) {
  //       errors.value[item] = orderData.response.data.errors[item][0]
  //         .replace(/order_items\.\d+\.pack_quantity/g, 'pack quantity')
  //         .replace(/order_items\.\d+\.pallet_quantity/g, 'pallet quantity')
  //         .replace(/order_items\.\d+\.batch_item_id/g, 'lot number')
  //         .replace('user id', 'user')
  //         .replace(/order_items\.\d+\.product_id/g, 'product')
  //         .replace(/order_items\.\d+\.expiry_date/g, 'expiry date')
  //         .replace(/order_items\.\d+\.cost/g, 'cost')
  //         .replace(/order_items\.\d+\.custom_discount/g, 'discount')
  //         .replace(/order_items\.\d+\.price_per_pack/g, 'price per pack')
  //     }
  //   })
  //   if (openRefund.value)
  //     Object.keys(refundData.response.data.errors).forEach((item, index) => {
  //       if (index == 0) {
  //         refundErrors.value[item] = refundData.response.data.errors[item][0]
  //           .replace(/products\.\d+\.pack_quantity/g, 'pack quantity')
  //           .replace(/products\.\d+\.pallet_quantity/g, 'pallet quantity')
  //           .replace('user id', 'user')
  //           .replace('stock id', 'stock')
  //           .replace(/products\.\d+\.product_id/g, 'product')
  //           .replace(/products\.\d+\.price/g, 'price')
  //       }
  //     })
  // }
}

onMounted(async () => {
  const date = new Date()
  formData.value.order_date = formatDate(date)
  ordersStore.$reset()
  filters.value['delivered'].per_page = 99999
  filters.value['delivered']['include[]'] = ['orderItemProduct']
  customerStore.$reset()
  await customerStore.actionGetCustomers({
    'include[]': ['shipping'],
    per_page: 99999,
  })
  await productStore.actionGetProductsBatches()
  await productStore.actionGetRefundProductList()
  // await relatedStore.actionGetRelatedProductsForSale()
  await ordersStore.actionGetOrders('delivered')
})
</script>

<template>
  <div class="new-order flex justify-center">
    <div class="form-content w-full max-w-7xl">
      <h1 class="uppercase">{{ $t('Add_new_order') }}</h1>
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
                    form.batch?.quantity
                      ? parseNumber(form.batch?.quantity) -
                          parseNumber(
                            formData.data[index].pallet_quantity.value
                          ) *
                            parseNumber(
                              form.batch?.product?.packs_quantity_per_pallet
                            )
                      : 0
                  )
                "
                :max-value="
                  form.batch?.quantity
                    ? String(
                        parseNumber(form.batch?.quantity) -
                          parseNumber(
                            formData.data[index].pallet_quantity.value
                          ) *
                            parseNumber(
                              form.batch?.product?.packs_quantity_per_pallet
                            )
                      )
                    : ''
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
                :placeholder="`${$t('Lot_Number')}`"
                :error="errors[`order_items.${index}.batch_item_id`]"
                @click="errors = {} as TOrdersErrors"
                :data="computedProductBatchesLotNumbers[form?.product_id]"
                :selected="form.batch"
                @select="selectLotNumber($event, index)"
                :show-key="'lot_number'"
                :is-dirty="true"
              />
              <UIInputDate
                :disabled="true"
                :placeholder="`${$t('Expire_Date')} *`"
                v-model="form.expiry_date"
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
            type="button"
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
                type="button"
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
            <div class="item flex justify-between">
              <h3>{{ $t('Shipping_Cost') }}:</h3>
              <div class="relative flex">
                <UIInput
                  symbol="€"
                  symbolClass="-translate-x-2"
                  v-model="formData.order_shipping_cost"
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
              <p class="body-text">
                {{ totalPromotion === 0 ? '' : totalPromotion < 0 ? '+' : '-'
                }}{{ formatCurrency(Math.abs(totalPromotion)) }}
              </p>
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
          <!--
          <div class="refund">
            <h2
              class="h2-header flex cursor-pointer justify-between"
              @click="openRefund = !openRefund"
              :class="{ open: openRefund }"
            >
              {{ $t('Refund_a_product') }}
              <IconArrow class="arrow" />
            </h2>
            <template v-if="openRefund">
              <div class="refund-main">
                <SingleSelect
                  @click="refundErrors = {} as TOrdersErrors"
                  :error="refundErrors.stock_id"
                  :placeholder="`${$t('Choose_a_stock')} *`"
                  :data="stocks"
                  :show-key="'name'"
                  :none="false"
                  :selected="refundFormData.stock"
                  @select="refundFormData.stock = $event"
                  :is-dirty="true"
                />
                <SingleSelect
                  @click="refundErrors = {} as TOrdersErrors"
                  :error="refundErrors.user_id"
                  :placeholder="`${$t('Order_Number')} *`"
                  :data="orders.delivered.data"
                  :show-key="'id'"
                  :none="false"
                  :selected="refundFormData.order"
                  @select="refundFormData.order = $event"
                  :is-dirty="true"
                />
                <UIInputDate
                  @click="refundErrors = {} as TOrdersErrors"
                  :error="refundErrors.order_date"
                  :placeholder="`${$t('Refund_date')} *`"
                  v-model="refundFormData.order_date"
                  :is-dirty="true"
                />
              </div>
              <div
                class="refund-products"
                v-for="(form, index) in refundFormData.data"
              >
                <SingleSelect
                  @click="refundErrors = {} as TOrdersErrors"
                  :error="refundErrors[`products.${index}.product_id`]"
                  :placeholder="`${$t('Choose_product')} *`"
                  :data="compProduct"
                  :show-key="'name'"
                  :none="false"
                  :selected="form.product"
                  @select="form.product = $event"
                  :is-dirty="true"
                />
                <UIInput
                  :model-value="form.quantity"
                  :disabled="!form.product.id"
                  :error="refundErrors[`products.${index}.quantity`]"
                  input-type="number"
                  :limit="true"
                  :placeholder="`${$t('QNT')} *`"
                  @update:model-value="updateQuantity($event, index)"
                  :is-dirty="true"
                />
                <UIInput
                  v-model="form.cost"
                  :disabled="!form.product.id"
                  :error="refundErrors[`products.${index}.cost`]"
                  :placeholder="`${$t('Cost')} *`"
                  symbol="€"
                  @update:model-value="refundErrors = {} as TOrdersErrors"
                  :is-dirty="true"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  class="h-[42px] w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                >
                  <IconMinus
                    class="cursor-pointer"
                    @click="removeRefundProduct(Number(index))"
                  />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                class="mb-1 h-8 self-start px-2"
                @click="addRefundProduct"
              >
                <IconPlus20 />
                <span class="body-text-2"> {{ $t('Add_product') }}</span>
              </Button>
              <div class="refund-total flex gap-2.5">
                <h2 class="uppercase">{{ $t('Refund_Total_Price') }}:</h2>
                <p class="body-text">
                  {{ formatCurrency(refundTotalPrice) }}
                </p>
              </div>
              <div class="pay-off flex gap-8">
                <UIRadioInput
                  v-model="refundFormData.refund_to_balance"
                  :label="$t('Pay_off')"
                  name="pay"
                  :inputValue="0"
                  :is-dirty="true"
                />
                <UIRadioInput
                  v-model="refundFormData.refund_to_balance"
                  :label="$t('Add_amount_to_the_balance')"
                  name="pay"
                  :inputValue="1"
                  :is-dirty="true"
                />
              </div>
            </template>
          </div>-->
        </div>
        <div v-if="openRefund" class="total-summary flex flex-col items-end">
          <div class="tot-item flex flex-col items-end gap-[18px]">
            <div class="flex gap-2.5">
              <h2>{{ $t('Order_Total_Price') }}:</h2>
              <p class="body-text">
                {{
                  formatCurrency(
                    compSubtotal +
                      parseEuroCurrency(formData.order_shipping_cost)
                  )
                }}
              </p>
            </div>
            <div class="flex gap-2.5">
              <h2>{{ $t('Refund_Total_Price') }}:</h2>
              <p class="body-text">
                {{ formatCurrency(refundTotalPrice) }}
              </p>
            </div>
          </div>
          <div class="sum-item flex gap-2.5">
            <h2>{{ $t('Balance') }}:</h2>
            <p class="body-text">{{ formatCurrency(totalBalance) }}</p>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton @click="submit" :disabled="isSubmitting">{{
            $t('Create')
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
  max-width: 220px;

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

.refund {
  margin-top: 32px;

  .h2-header {
    color: var(--neutral-400);
    border-bottom: 1px solid var(--neutral-300);
    margin-bottom: 21px;

    .arrow {
      fill: none;
    }

    &.open {
      .arrow {
        transform: rotateX(-180deg);
      }
    }
  }

  .refund-main {
    display: grid;
    grid-template-columns: repeat(3, 290px);
    gap: 16px;
    padding: 12px 40px;
    background: var(--neutral-200);
    border-radius: 4px;
    margin-bottom: 16px;

    .select-content,
    label {
      background: var(--white);
      border-radius: 4px;
    }
  }

  .refund-products {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: 300px 126px 126px 147px 24px;
    gap: 19px;
  }

  .refund-total {
    color: var(--gray-300);
    margin-top: 16px;
  }

  .pay-off {
    margin-top: 21px;
  }
}

.total-summary {
  padding: 12px 40px;
  background: var(--gray-50);

  h2,
  .body-text {
    color: var(--gray-300);
  }

  .tot-item {
    padding-bottom: 9px;
    border-bottom: 1px solid var(--gray-300);
  }

  .sum-item {
    margin-top: 18px;
  }
}
</style>
