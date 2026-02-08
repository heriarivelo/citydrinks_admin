<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import { useRoute, useRouter } from 'vue-router'
import UIInputAuth from '@/components/ui/UIInputAuth.vue'

onMounted(async () => {
  if (route.query?.otp) {
    const data = await authStore.actionOtpLogin(String(route.query?.otp))
    otp.value = true
  }
})
const route = useRoute()
const user_name = ref('')
const password = ref('')
const remember = ref('')
const success = ref('')
const counter = ref(5)
const token = ref('')
const email = ref('')
const code = ref('')
const otp_password = ref('')
const otp_password_confirmation = ref('')
const loader = ref(false)
const otp = ref(false)
const password_reset = ref(false)
const error = ref('')
const authStore = useAdminAuthStore()
const router = useRouter()

const getMe = computed(() => authStore.getMe)

const otpRemoveOrReset = async () => {
  loader.value = true
  error.value = ''
  success.value = ''
  let params = {
    password: otp_password.value,
    password_confirmation: otp_password_confirmation.value,
    email: '',
    token: '',
  }
  if (otp.value) {
    delete params.email
    delete params.token
    const data = await authStore.otpRemove(params)

    if (!data.error && !data.data?.data?.one_time_password) {
      await authStore.passOneTimePassword()
      await router.push('/admin/dashboard')
    } else {
      error.value = data.errors.password[0]
    }
  }
  if (password_reset.value) {
    params.email = email.value
    params.token = token.value
    const data = await authStore.actionResetPassword(token.value, params)

    if (!data.error) {
      success.value = data?.data?.message
      otp_password.value = ''
      otp_password_confirmation.value = ''
      let interval = setInterval(() => {
        counter.value--
      }, 1000)
      setTimeout(() => {
        otp.value = false
        password_reset.value = false
        success.value = ''
        router.push({ name: 'Auth' })
        clearInterval(interval)
      }, 5000)
    } else {
      error.value = data?.errors?.password[0] ?? data?.data?.message
    }
  }
  loader.value = false
}

const login = async () => {
  loader.value = true
  let params = {
    user_name: user_name.value,
    password: password.value,
  }
  try {
    const data = await authStore.actionLogin(params)
    error.value = ''
    if (!data.error && data?.data?.data?.one_time_password) {
      otp.value = true
    } else if (!data.error && !data?.data?.data?.one_time_password) {
      authStore.me = data?.data?.data
      await authStore.setAuth(data?.data?.data?.token)
      await router.push('/admin/dashboard')
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (e) {
    console.log(e)
  } finally {
    loader.value = false
  }
}

const verify = async () => {
  loader.value = true
  error.value = ''
  let params = {
    code: code.value,
  }

  const data = await authStore.twoFactor(params)

  if (!data.error || !data.message) {
    await authStore.passTwoFactor()
    const user = await authStore.actionGetMe()

    if (user?.is_admin) {
      await router.push('/admin/dashboard')
    } else {
      await router.push({ name: 'UserProducts' })
    }
  } else {
    error.value = data.message
  }
  loader.value = false
}

const resetTwoFactor = () => {
  localStorage.clear()
  window.location.reload()
}
</script>

<template>
  <section class="auth-section">
    <div class="auth flex flex-col items-center gap-8">
      <img src="@/assets/images/png/auth-logo.png" alt="logo" />
      <h1 class="uppercase">{{ $t('Login_to_your_account') }}</h1>
      <form
        action=""
        v-if="!otp && !password_reset"
        @submit.prevent="login"
        class="flex w-full flex-col"
      >
        <UIInputAuth
          :legend="$t('UserName')"
          type="text"
          fieldset="auth"
          :placeholder="$t('Enter_your_username')"
          :errorWithoutText="error"
          v-model="user_name"
          @update:model-value="error = ''"
        />
        <UIInputAuth
          :legend="$t('Password')"
          type="password"
          fieldset="auth"
          :placeholder="$t('Enter_password')"
          :error="error"
          v-model="password"
          @update:model-value="error = ''"
        />
        <div class="forget-remember">
          <router-link class="subtitle" :to="{ name: 'ForgetPassword' }"
            >{{ $t('Forgot_password') }} ?
          </router-link>
          <label class="subtitle-2">
            <input type="checkbox" v-model="remember" />
            {{ $t('Remember_me') }}
          </label>
        </div>
        <button>{{ $t('Log_In') }}</button>
      </form>
      <form
        action=""
        v-if="otp || password_reset"
        @submit.prevent="otpRemoveOrReset"
        class="flex w-full flex-col"
      >
        <UIInputAuth
          :legend="$t('New_Password')"
          type="password"
          fieldset="auth"
          v-model="otp_password"
          :errorWithoutText="error"
          :placeholder="$t('Enter_password')"
        />
        <UIInputAuth
          :legend="$t('Confirm_New_Password')"
          type="password"
          fieldset="auth"
          :error="error"
          v-model="otp_password_confirmation"
          :placeholder="$t('Enter_password')"
        />
        <button>{{ $t('Log_In') }}</button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
@import 'scss/auth';
</style>
