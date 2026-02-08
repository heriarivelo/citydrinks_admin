import { defineStore } from 'pinia'
import {
  TProduct,
  TProducts,
  TQuery,
} from '@/modules/stocks/products/store/types/productTypes.ts'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: {} as TProducts,
    transferProducts: {} as TProducts,
    product: {} as TProduct,
    productBatches: {} as TProducts,
    refundProductList: {} as TProducts,
    query: {
      page: 1,
      per_page: 50,
      include: ['productTariffs', 'productLimitsPerPack', 'category'],
    } as TQuery,
  }),
  actions: {
    async actionGetProducts(params = {} as TQuery) {
      try {
        const { data } = await this.$axios.get('/admin/products', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.products = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetProductsBatches() {
      try {
        const { data } = await this.$axios.get('/admin/products/batches', {
          params: {
            reserved: false,
          },
        })
        this.productBatches = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetRefundProductList() {
      try {
        const { data } = await this.$axios.get('/admin/refundProductList')
        this.refundProductList = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetProductsBatchItems(id: number, user_id: number) {
      try {
        const { data } = await this.$axios.get(
          `/admin/products/${id}/batch_items`,
          {
            params: {
              user_id: user_id,
            },
          }
        )
        return data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetProductsForTransfer(params: any = {}) {
      try {
        const { data } = await this.$axios.get('/admin/products/transfer', {
          params: {
            ...params,
          },
        })
        const filteredData = data.data.data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        )
        this.transferProducts = { data: filteredData }
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetProductById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/products/${id}`, {
          params: {
            include: [
              'productTariffs',
              'productLimitsPerPack',
              'category',
              'relatedProducts',
            ],
          },
        })
        this.product = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateProduct(params: any) {
      try {
        const { data } = await this.$axios.post('/admin/products', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateProduct(params: any, id: number) {
      try {
        const { data } = await this.$axios.post(`/admin/products/${id}`, params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteProduct(id: number) {
      try {
        const { data } = await this.$axios.delete(`/admin/products/${id}`)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/products/export', {
          responseType: 'blob',
        })
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'data.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.log(err)
      }
    },
  },
})
