import axios from 'axios'
import { useNotificationStore } from '@/store/notification.ts'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  // withCredentials:true
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.data.message === 'Unauthenticated.') {
      localStorage.removeItem('token')
      window.location.reload()
    }
    if (error.response.data.error_code || error.response.data.error_code == 0) {
      const notificationStore = useNotificationStore()
      const errorMsg =
        typeof error.response.data.error === 'string'
          ? error.response.data.error
          : typeof error.response.data.message === 'string'
            ? error.response.data.message
            : null

      if (errorMsg) {
        notificationStore.addNotification({
          id: new Date().getTime(),
          type: 'warning',
          notification: errorMsg,
        })
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
