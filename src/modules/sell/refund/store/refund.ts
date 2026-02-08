import { defineStore } from 'pinia'

export const useRefundsStore = defineStore('refunds', {
  actions: {
    async actionCreateRefund(params = {}) {
      try {
        const { data } = await this.$axios.post(`admin/refunds`, params)
        return data
      } catch (e) {
        console.log(e)
        return e
      }
    },
  },
})
