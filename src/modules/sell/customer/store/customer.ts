import { defineStore } from 'pinia'
import {
  TCustomer,
  TCustomerQuery,
  TCustomers,
} from '@/modules/sell/customer/store/types/customerTypes.ts'
import { QueryClient } from '@tanstack/vue-query'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: {} as TCustomers,
    customer: {} as TCustomer,
    query: {
      page: 1,
      per_page: 50,
    } as TCustomerQuery,
  }),
  actions: {
    async actionGetCustomers(params = {}) {
      try {
        const { data } = await this.$axios.get('/admin/customers', {
          params: {
            ...this.query,
            ...params,
          },
        })
        this.customers = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionGetCustomerById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/customers/${id}`, {
          params: {
            'include[]': ['shipping', 'tariffs'],
          },
        })
        this.customer = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionCreateCustomer(params: TCustomer) {
      try {
        const { data } = await this.$axios.post('/admin/customers', params)
        const queryClient = new QueryClient()
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateCustomer(params: TCustomer) {
      try {
        const { data } = await this.$axios.put(
          `/admin/customers/${params.id}`,
          params
        )
        const queryClient = new QueryClient()
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeleteCustomer(id: number) {
      try {
        const { data } = await this.$axios.delete(`/admin/customers/${id}`)
        const queryClient = new QueryClient()
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionDeactivateCustomer(customer: TCustomer) {
      try {
        const { data } = await this.$axios.patch(
          `/admin/customers/${customer.id}/status`,
          { status: customer.status ? 0 : 1 }
        )
        const queryClient = new QueryClient()
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/customers/export', {
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
