import { defineStore } from 'pinia'
import { TCategories, TCategory } from '@/store/types/categoryTypes.ts'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    category: {} as TCategory,
    categories: {} as TCategories,
  }),
  actions: {
    async actionGetCategories() {
      try {
        const { data } = await this.$axios.get('admin/categories')
        this.categories = data?.data
      } catch (error) {
        console.log(error)
      }
    },
    async actionCreateCategory(params: TCategory) {
      try {
        const { data } = await this.$axios.post('admin/categories', params)
        return data
      } catch (error) {
        console.log(error)
        return error
      }
    },
    async actionUpdateCategory(params: TCategory) {
      try {
        const { data } = await this.$axios.put(
          `admin/categories/${params.id}`,
          params
        )
        return data
      } catch (error) {
        console.log(error)
      }
    },
    async actionDeleteCategory(id: number) {
      try {
        const { data } = await this.$axios.delete(`admin/categories/${id}`)
        return data
      } catch (error) {
        console.log(error)
      }
    },
  },
})
