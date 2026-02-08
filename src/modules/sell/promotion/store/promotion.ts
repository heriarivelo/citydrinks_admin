import { defineStore } from 'pinia'
import {
  TPromotion,
  TPromotions,
  TQuery,
} from '@/modules/sell/promotion/store/types/promotionTypes.ts'

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    promotions: {} as TPromotions,
    promotion: {} as TPromotion,
    query: {
      page: 1,
      per_page: 50,
    } as TQuery,
  }),
  actions: {
    async actionGetPromotions() {
      try {
        const { data } = await this.$axios.get('/admin/promotions', {
          params: this.query,
        })
        this.promotions = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetPromotionById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/promotions/${id}`, {
          params: {
            'include[]': 'products',
          },
        })
        this.promotion = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreatePromotion(params: TPromotion) {
      try {
        const { data } = await this.$axios.post('/admin/promotions', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdatePromotion(params: TPromotion) {
      try {
        const { data } = await this.$axios.put(
          `/admin/promotions/${params.id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeletePromotion(id: number) {
      try {
        const { data } = await this.$axios.delete(`/admin/promotions/${id}`)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/promotions/export', {
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
