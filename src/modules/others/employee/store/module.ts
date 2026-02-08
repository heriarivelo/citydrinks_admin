import { defineStore } from 'pinia'
import { TModules } from '@/modules/others/employee/store/types/moduleTypes.ts'

export const useModuleStore = defineStore('module', {
  state: () => ({
    modules: {} as TModules,
  }),
  actions: {
    async getModules() {
      try {
        const { data } = await this.$axios.get('/admin/modules', {
          params: {
            'include[0]': 'permissions',
          },
        })
        this.modules = data.data
      } catch (err) {
        console.log(err)
      }
    },
  },
})
