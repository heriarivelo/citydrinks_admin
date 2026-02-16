import { defineStore } from 'pinia'
import {
  TEmployee,
  TEmployeeQuery,
  TEmployees,
} from '@/modules/others/employee/store/types/employeeTypes.ts'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: {} as TEmployees,
    employee: {} as TEmployee,
    query: {
      page: 1,
      per_page: 12,
      'include[0]': 'role',
    } as TEmployeeQuery,
  }),
  actions: {
    async createEmployee(params: TEmployee) {
      try {
        const { data } = await this.$axios.post('/admin/employers', params)
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionUpdateEmployee(params: TEmployee) {
      try {
        const { data } = await this.$axios.put(
          `/admin/employers/${params.id}`,
          params
        )
        return data
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async actionGetEmployeeById(id: number) {
      try {
        const { data } = await this.$axios.get(`/admin/employers/${id}`, {
          params: {
            'include[0]': 'role',
          },
        })
        this.employee = data.data.data
      } catch (err) {
        console.log(err)
      }
    },
    async actionDeactivateEmployee(employee: TEmployee) {
      try {
        await this.$axios.patch(`/admin/employers/${employee.id}`, {
          status: employee.status == 1 ? 2 : 1,
        })
        await this.getEmployees()
      } catch (err) {
        console.log(err)
      }
    },
    async actionDeleteById(id: number) {
      try {
        await this.$axios.delete(`/admin/employers/${id}`)
        await this.getEmployees()
      } catch (err) {
        console.log(err)
      }
    },
    async getEmployees() {
      try {
        const { data } = await this.$axios.get('/admin/employers', {
          params: {
            ...this.query,
          },
        })
        this.employees = data.data
      } catch (err) {
        console.log(err)
      }
    },
    async exportCSV() {
      try {
        const { data } = await this.$axios.get('/admin/employers/export', {
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
