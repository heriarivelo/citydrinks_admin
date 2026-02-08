import { createApp } from 'vue'
import '@/assets/styles/style.css'
import App from '@/App.vue'
import router from '@/router'
import pinia from '@/store'
import i18n from './utils/i18n'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)
app.config.globalProperties.$config = {
  baseURL: import.meta.env.VITE_BASE_URL,
}
app.use(router)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  },
})
app.use(pinia)
app.use(i18n)

app.mount('#app')
