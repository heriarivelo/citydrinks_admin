import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
  state: () => ({
    headerData: {
      h2: '',
      span: '',
      span2: '',
    },
  }),
})
