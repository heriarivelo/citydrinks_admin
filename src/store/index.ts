import axiosClient from '@/utils/axiosClient'
import { createPinia } from 'pinia'

const pinia = createPinia()

pinia.use(({ store }) => {
  store.$axios = axiosClient
})

export default pinia
