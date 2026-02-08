import { defineStore } from 'pinia'
import {
  TProvider,
  TProviderQuery,
  TProviders,
} from '@/modules/buy/providers/store/types/providerTypes.ts'

export const useProvidersStore = defineStore('provider', {
  state: () => ({
    providers: {} as TProviders,
    provider: {} as TProvider,
    query: {
      page: 1,
      per_page: 999,
    } as TProviderQuery,
  }),
  actions: {
    async actionCreateProviders(params: TProvider) {
      try {
        const { data } = await this.$axios.post('/admin/providers', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateProviders(params: TProvider) {
      try {
        const { data } = await this.$axios.put(
          `/admin/providers/${params.id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionDeleteProviders(id: number) {
      try {
        const { data } = await this.$axios.delete(`/admin/providers/${id}`)
        return data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetProviderById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/providers/${id}`)
        this.provider = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionUpdateProviderBalance(id: string | number, params: any) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/providers/${id}/update_balance`,
          params
        )
        return data.data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionGetProviders(params = {}) {
      try {
        const { data } = await this.$axios.get('/admin/providers', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.providers = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/providers/export', {
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
