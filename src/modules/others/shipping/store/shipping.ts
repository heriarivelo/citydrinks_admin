import { defineStore } from 'pinia'
import {
  TShipping,
  TShippingQuery,
  TShippings,
} from '@/modules/others/shipping/store/types/shippingTypes.ts'

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    shippings: {} as TShippings,
    shipping: {} as TShipping,
    query: {
      page: 1,
      per_page: 12,
    } as TShippingQuery,
  }),
  actions: {
    async actionGetShippings(params = {} as TShippingQuery) {
      try {
        const { data } = await this.$axios.get('/admin/shippings', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.shippings = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateShipping(params: any) {
      try {
        const { data } = await this.$axios.post('/admin/shippings', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionGetShippingById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/shippings/${id}`)
        this.shipping = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionUpdateShipping(id: number, params: any) {
      try {
        const { data } = await this.$axios.put(`/admin/shippings/${id}`, params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteShipping(id: number) {
      try {
        const { data } = await this.$axios.delete(`/admin/shippings/${id}`)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/shippings/export', {
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
