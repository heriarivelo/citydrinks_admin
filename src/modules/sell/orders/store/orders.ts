import { defineStore } from 'pinia'
import {
  approvedData,
  TOrder,
  TOrdersFilters,
  TOrdersItems,
} from '@/modules/sell/orders/store/types/ordersTypes.ts'
import { parseNumber } from '@/lib/utils'

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

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: {
      waiting: {} as TOrdersItems,
      approved: {} as TOrdersItems,
      on_the_way: {} as TOrdersItems,
      delivered: {} as TOrdersItems,
    },
    ordersAll: {} as TOrdersItems,
    order: {} as TOrder,
    filters: {
      waiting: {
        per_page: 10,
        status: 1,
      } as TOrdersFilters,
      approved: {
        per_page: 10,
        status: 2,
      } as TOrdersFilters,
      on_the_way: {
        per_page: 10,
        status: 3,
      } as TOrdersFilters,
      delivered: {
        per_page: 12,
        status: 5,
      } as TOrdersFilters,
    },
    approvedCount: {
      pallet: 0,
      pack: 0,
    },
    approvedData: {} as {
      data: approvedData[]
      per_page: number
      last_page: number
    },
  }),
  actions: {
    async actionInitOrders() {
      try {
        const fetchTasks = ['waiting', 'approved', 'on_the_way'].map((key) =>
          this.actionGetOrders(key as keyof typeof this.filters)
        )
        await Promise.all(fetchTasks)
      } catch (error) {
        console.error('Error initializing orders:', error)
      }
    },
    async actionUpdateOrderStatus(status: number, orderId: number) {
      try {
        await this.$axios.patch(`admin/orders/${orderId}/update_status`, {
          status,
        })
        await this.actionGetSeeAll()
        await this.actionInitOrders()
      } catch (e) {
        console.log(e)
      }
    },
    async actionGetOrders(type: string, per_page = 10) {
      try {
        const data = await this.$axios.get('admin/orders', {
          params: {
            ...this.filters[type],
            per_page,
          },
        })
        this.orders[type] = data.data.data
      } catch (e) {
        console.log(e)
      }
    },
    async actionGetOrdersAll() {
      try {
        const data = await this.$axios.get('admin/orders', {
          params: {
            per_page: 100,
          },
        })
        this.ordersAll = data.data.data
      } catch (e) {
        console.log(e)
      }
    },
    async actionGetOrder(id: number) {
      try {
        const { data } = await this.$axios.get(`admin/orders/${id}`)
        this.order = data.data.data
      } catch (e) {
        console.log(e)
      }
    },
    async actionGetOrderCustom(id: number) {
      try {
        const { data } = await this.$axios.get(`admin/orders/${id}`)
        const orderItems = data.data.data.orderItems.data.reduce(
          (acc, item) => {
            const existingItems = acc.filter(
              (i) => i.product_id === item.product_id
            )

            if (existingItems.length > 0) {
              const packsQuantityPerPallet = parseNumber(
                item.batchItem.data.product.data.packs_quantity_per_pallet
              )
              const quantity = existingItems.reduce((sum, existingItem) => {
                return (
                  sum +
                  parseNumber(existingItem.quantity) +
                  parseNumber(item.quantity)
                )
              }, 0)
              existingItems.forEach((existingItem) => {
                existingItem.pallet_quantity = Math.floor(
                  quantity / packsQuantityPerPallet
                )
                existingItem.pack_quantity = quantity % packsQuantityPerPallet
                existingItem.total_price = (
                  parseNumber(existingItem.total_price) +
                  parseNumber(item.total_price)
                ).toFixed(2)
                existingItem.final_price = (
                  parseNumber(existingItem.final_price) +
                  parseNumber(item.final_price)
                ).toFixed(2)
              })
            } else {
              acc.push(item)
            }
            return acc
          },
          []
        )

        this.order = {
          ...data.data.data,
          orderItems: { data: orderItems },
        }
      } catch (e) {
        console.log(e)
      }
    },

    async actionGetOrderCustomRelated(id: number) {
      try {
        const { data } = await this.$axios.get(`admin/orders/${id}`)
        const relatedProductsMap = new Map()

        const orderItems = data.data.data.orderItems.data.map((item) => {
          const processedItem = {
            ...item,
            quantity: calculatePallets(
              item.pack_quantity || 0,
              item.pallet_quantity || 0,
              item.packs_quantity_per_pallet || 1,
              false
            ),
          }

          const productId = item.batchItem.data.product.data.id
          const relatedProducts =
            item.batchItem.data.product.data.related_products

          if (!relatedProductsMap.has(productId)) {
            relatedProductsMap.set(productId, [])
          }

          relatedProducts.forEach((relProd) => {
            const existingRelProd = relatedProductsMap
              .get(productId)
              .find(
                (existing) =>
                  existing.related_product_id === relProd.related_product_id
              )

            if (!existingRelProd) {
              relatedProductsMap.get(productId).push(relProd)
            }
          })

          return processedItem
        })

        const finalOrderItems = orderItems.map((item, index, array) => {
          const productId = item.batchItem.data.product.data.id

          const isLastOccurrence =
            array.findLastIndex(
              (i) => i.batchItem.data.product.data.id === productId
            ) === index

          if (isLastOccurrence) {
            return {
              ...item,
              batchItem: {
                ...item.batchItem,
                data: {
                  ...item.batchItem.data,
                  product: {
                    data: {
                      ...item.batchItem.data.product.data,
                      related_products: relatedProductsMap.get(productId) || [],
                    },
                  },
                },
              },
            }
          }

          return item
        })

        this.order = {
          ...data.data.data,
          orderItems: { data: finalOrderItems },
        }
      } catch (e) {
        console.log(e)
      }
    },

    async actionCreateOrder(params = {}) {
      try {
        const { data } = await this.$axios.post(`admin/orders`, params)
        return data
      } catch (e) {
        console.log(e)
        return e
      }
    },
    async actionUpdateOrder(id: number, params = {}) {
      try {
        const { data } = await this.$axios.put(`admin/orders/${id}`, params)
        return data
      } catch (e) {
        console.log(e)
        return e
      }
    },
    async actionResetFilter() {
      this.filters = {
        waiting: { per_page: 10, status: 1 },
        approved: { per_page: 10, status: 2 },
        on_the_way: { per_page: 10, status: 3 },
      }
    },
    async actionGetSeeAll(page: string = '1') {
      try {
        this.approvedCount = {
          pallet: 0,
          pack: 0,
        }
        const res = await this.$axios.get('admin/orders/see_all', {
          params: {
            per_page: 50,
            page,
          },
        })
        res.data.data.data.forEach((order) => {
          this.approvedCount.pack += Number(order?.pack_quantity)
          this.approvedCount.pallet += Number(order?.pallet_quantity)
        })
        this.approvedData = res.data.data
        return res.data.data
      } catch (e) {
        console.log(e)
        return e
      }
    },
  },
})
