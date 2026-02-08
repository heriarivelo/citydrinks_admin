import { defineStore } from 'pinia'
import { TTariff, TTariffs } from '@/store/types/tariffTypes.ts'

export const useTariffStore = defineStore('tariff', {
  state: () => ({
    tariff: {} as TTariff,
    tariffs: {} as TTariffs,
  }),
  actions: {
    async actionGetTariffs() {
      try {
        const { data } = await this.$axios.get('admin/tariffs')
        this.tariffs = data?.data
      } catch (error) {
        console.log(error)
      }
    },
    async actionCreateTariff(params: TTariff) {
      try {
        const { data } = await this.$axios.post('admin/tariffs', params)
        return data
      } catch (error) {
        console.log(error)
      }
    },
    async actionUpdateTariff(params: TTariff) {
      try {
        const { data } = await this.$axios.put(
          `admin/tariffs/${params.id}`,
          params
        )
        return data
      } catch (error) {
        console.log(error)
      }
    },
    async actionDeleteTariff(id: number) {
      try {
        const { data } = await this.$axios.delete(`admin/tariffs/${id}`)
        return data
      } catch (error) {
        console.log(error)
      }
    },
  },
})
