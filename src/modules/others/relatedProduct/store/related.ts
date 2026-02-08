import { defineStore } from 'pinia'
import {
  TRelatedProduct,
  TRelatedProducts,
  TRelatedQuery,
} from '@/modules/others/relatedProduct/store/types/relatedTypes.ts'

export const useRelatedStore = defineStore('related', {
  state: () => ({
    relatedProducts: {} as TRelatedProducts,
    relatedProduct: {} as TRelatedProduct,
    query: {
      page: 1,
      per_page: 50,
    } as TRelatedQuery,
  }),
  actions: {
    async actionGetRelatedProducts(params = {} as TRelatedQuery) {
      try {
        const { data } = await this.$axios.get('/admin/related_products', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.relatedProducts = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetRelatedProductsForSale(params = {} as TRelatedQuery) {
      try {
        const { data } = await this.$axios.get(
          '/admin/related_products/sellable',
          {
            params: {
              ...this.query,
              ...params,
            },
          }
        )
        this.relatedProducts = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateRelatedProduct(params: any) {
      try {
        const { data } = await this.$axios.post(
          '/admin/related_products',
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateRelatedProduct(params: any) {
      try {
        const { data } = await this.$axios.put(
          `/admin/related_products/${params.id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteRelatedProduct(id: number) {
      try {
        const { data } = await this.$axios.delete(
          `/admin/related_products/${id}`
        )
        return data
      } catch (err) {
        return err
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get(
          '/admin/related_products/export',
          {
            responseType: 'blob',
          }
        )
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
