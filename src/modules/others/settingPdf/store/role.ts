import { defineStore } from 'pinia'
import {
  TRole,
  TRoleQuery,
  TRoles,
} from '@/modules/others/role/store/types/roleTypes.ts'

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: {} as TRoles,
    role: {} as TRole,
    query: {
      'include[0]': 'modules',
      'include[1]': 'permissions',
      page: 1,
      per_page: 12,
    } as TRoleQuery,
  }),
  actions: {
    async getRoles() {
      try {
        const { data } = await this.$axios.get('/admin/roles', {
          params: {
            ...this.query,
          },
        })
        this.roles = data.data
      } catch (err) {
        console.log(err)
      }
    },
  },
})
