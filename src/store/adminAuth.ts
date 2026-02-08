import { defineStore } from 'pinia'
import { TAuth, TMe } from '@/store/types/adminAuthTypes.ts'
import { useNotificationStore } from '@/store/notification.ts'

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    auth: localStorage.token,
    step: 1,
    me: {} as TMe,
  }),
  getters: {
    getAuth: (state) => state.auth,
    getStep: (state) => state.step,
    getMe: (state) => state.me,
  },
  actions: {
    async passOneTimePassword() {
      this.me.one_time_password = null
    },
    async passTwoFactor() {
      this.me.one_time_password = null
    },
    async setAuth(token: string) {
      this.auth = token
    },
    async actionLogin(params: TAuth) {
      try {
        const { data } = await this.$axios.post('admin/login', params)
        localStorage.setItem('token', data?.data?.data?.token)
        this.auth = data?.data?.data?.token

        return data
      } catch (error) {
        console.log(error)
        error.response.data.error = true
        return error.response.data
      }
    },
    async actionOtpLogin(hash: string) {
      try {
        const { data } = await this.$axios.post(
          `employee/login_with_otp/${hash}`
        )
        console.log(data)
        localStorage.setItem('token', data?.data?.token)
        this.auth = data?.data?.token

        return data
      } catch (error) {
        console.log(error)
        return error
      }
    },
    async otpRemove(params: any) {
      try {
        const { data } = await this.$axios.patch(
          'admin/remove/one_time_password',
          params
        )
        return data
      } catch (error) {
        error.response.data.error = true
        return error.response.data
      }
    },
    async twoFactor(params: any) {
      try {
        const { data } = await this.$axios.post('two_factor_code_check', params)
        return data
      } catch (error) {
        error.response.data.error = true
        return error.response.data
      }
    },
    async actionLogOut() {
      try {
        localStorage.removeItem('token')
        window.location.reload()
        return false
      } catch (error) {
        return error.response.data.message
      }
    },
    async actionForgetPassword(params: TAuth) {
      try {
        const { data } = await this.$axios.post('password/email', params)
        return data
      } catch (error) {
        error.response.data.error = true
        return error.response.data
      }
    },
    async actionResetPassword(token: string, params: TAuth) {
      try {
        const { data } = await this.$axios.post(
          `reset-password/${token}`,
          params
        )
        return data
      } catch (error) {
        error.response.data.error = true
        return error.response.data
      }
    },
    async actionGetMe() {
      try {
        const { data } = await this.$axios.get('admin/me')
        this.me = await data.data
        return data.data
      } catch (error) {
        console.log(error)
        return error.response.data
      }
    },
    async actionUpdateProfile(params: any) {
      try {
        const notificationStore = useNotificationStore()
        await this.$axios.put('/admin/employers/update_profile', params)
        notificationStore.addNotification({
          id: new Date().getTime(),
          type: 'success',
          notification: 'Profile updated successfully.',
        })
      } catch (err) {
        console.log(err)
      }
    },
    async actionUpdateProfilePassword(params: any) {
      try {
        const notificationStore = useNotificationStore()
        await this.$axios.post('/admin/employers/change_password', params)
        notificationStore.addNotification({
          id: new Date().getTime(),
          type: 'success',
          notification: 'Profile updated successfully.',
        })
      } catch (err) {
        console.log(err)
      }
    },
  },
})
