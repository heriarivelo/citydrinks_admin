<script setup lang="ts">
import UIInputAuth from '@/components/ui/UIInputAuth.vue'
import { ref } from 'vue'
import { useAdminAuthStore } from '@/store/adminAuth.ts'

const loader = ref(false)
const email = ref('')
const error = ref('')
const authStore = useAdminAuthStore()
const success = ref('')

const reset = async () => {
  loader.value = true
  success.value = ''
  error.value = ''
  let params = {
    email: email.value,
  }

  const data = await authStore.actionForgetPassword(params)

  if (!data?.error) {
    success.value = data?.data?.message
  } else {
    error.value = data?.message ?? data?.errors?.email[0] ?? data?.data?.message
  }
  loader.value = false
}
</script>

<template>
  <section class="auth-section">
    <div class="auth flex flex-col items-center gap-8">
      <img src="@/assets/images/png/auth-logo.png" alt="auth-logo" />
      <h1 class="uppercase">{{ $t('Password_reset') }}</h1>
      <form @submit.prevent="reset" class="flex w-full flex-col">
        <UIInputAuth
          :legend="$t('Email')"
          type="Email"
          fieldset="auth"
          :placeholder="$t('Enter_your_email')"
          :error="error"
          v-model="email"
        />
        <button>{{ $t('Reset_Password') }}</button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
@import 'scss/auth';
</style>
