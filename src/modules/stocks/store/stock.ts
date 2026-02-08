import { defineStore } from 'pinia'
import {
  TStock,
  TStockItems,
  TStockQuery,
} from '@/modules/stocks/store/types/stockTypes.ts'

export const useStockStore = defineStore('stock', {
  state: () => ({
    stocks: [] as TStock[],
    selectedStock: {} as TStock,
    stockItems: {} as TStockItems,
    query: {
      page: 1,
      per_page: 999,
    } as TStockQuery,
  }),
  actions: {
    async actionGetStocks() {
      try {
        const { data } = await this.$axios.get('/admin/stocks')
        this.stocks = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateStock(params: TStock) {
      try {
        const { data } = await (<any>this.$axios.post('/admin/stocks', params))
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionUpdateStock(params: TStock, id: string | number) {
      try {
        const { data } = await (<any>(
          this.$axios.put(`/admin/stocks/${id}`, params)
        ))
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetStock(id: string | number) {
      try {
        const { data } = await (<any>this.$axios.get(`/admin/stocks/${id}`))
        return data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetStockItems(id: string | number) {
      try {
        const { data } = await (<any>this.$axios.get(
          `/admin/batch_items/${id}`,
          {
            params: {
              ...this.query,
            },
          }
        ))
        this.stockItems = data.data
        return data.data
      } catch (err) {
        console.log(err)
      }
    },
    async exportCSV(id: string | number) {
      try {
        const { data } = await this.$axios.get(
          `/admin/batch_items/${id}/export`,
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
