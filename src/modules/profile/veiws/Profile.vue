<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { ref, watchEffect } from 'vue'
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import { storeToRefs } from 'pinia'
import { TMe, TMeError } from '@/store/types/adminAuthTypes.ts'
import { Button } from '@/components/ui/button'

const adminAuthStore = useAdminAuthStore()
const { me } = storeToRefs(adminAuthStore)
const profile = ref({} as TMe)
const errors = ref({} as TMeError)
const change = ref(false)

const submit = async () => {
  if (
    profile.value.old_password &&
    profile.value.password &&
    profile.value.password_confirmation
  ) {
    await adminAuthStore.actionUpdateProfilePassword({
      old_password: profile.value.old_password,
      password: profile.value.password,
      password_confirmation: profile.value.password_confirmation,
    })
    profile.value.old_password = ''
    profile.value.password = ''
    profile.value.password_confirmation = ''
  } else {
    await adminAuthStore.actionUpdateProfile({
      user_name: profile.value.user_name,
      phone_number: profile.value.phone_number,
      email: profile.value.email,
      first_name: profile.value.first_name,
      last_name: profile.value.last_name,
    })
  }
  change.value = false
  await adminAuthStore.actionGetMe()
}

watchEffect(() => {
  if (me.value) {
    profile.value = {
      ...me.value,
    }
  }
})
</script>

<template>
  <div class="profile flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('My_account') }}</h1>
      <form class="flex flex-col" @submit.prevent="submit">
        <div class="content gap-x-6 gap-y-4">
          <UIInput
            @update:model-value="errors = {} as TMeError"
            :input-type="'email'"
            :error="errors.email"
            :placeholder="$t('Email')"
            v-model="profile.email"
          />
          <UIInput
            @update:model-value="errors = {} as TMeError"
            :error="errors.user_name"
            :placeholder="$t('Username')"
            v-model="profile.user_name"
          />
          <UIInput
            @update:model-value="errors = {} as TMeError"
            :error="errors.phone_number"
            :placeholder="$t('Phone_Number')"
            v-model="profile.phone_number"
          />
          <UIInput
            @update:model-value="errors = {} as TMeError"
            :error="errors.first_name"
            :placeholder="$t('First_Name')"
            v-model="profile.first_name"
          />
          <UIInput
            @update:model-value="errors = {} as TMeError"
            :error="errors.last_name"
            :placeholder="$t('Last_Name')"
            v-model="profile.last_name"
          />
        </div>
        <div class="change flex flex-col gap-6">
          <h2 class="uppercase">{{ $t('Change_Password') }}</h2>
          <div class="flex gap-6">
            <UIInput
              @update:model-value="errors = {} as TMeError"
              :error="errors.old_password"
              :placeholder="$t('Current_password')"
              v-model="profile.old_password"
              inputType="password"
            />
            <Button
              class="body-text h-[42px] uppercase"
              type="button"
              variant="secondary"
              @click="change = !change"
            >
              {{ $t('change') }}
            </Button>
          </div>
          <div class="flex flex-col gap-6" v-if="change">
            <UIInput
              @update:model-value="errors = {} as TMeError"
              :error="errors.password"
              :placeholder="$t('New_password')"
              v-model="profile.password"
              inputType="password"
            />
            <UIInput
              @update:model-value="errors = {} as TMeError"
              :error="errors.password_confirmation"
              :placeholder="$t('Confirm_new_password')"
              v-model="profile.password_confirmation"
              inputType="password"
            />
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Save') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/buy/providers')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      .content {
        max-width: 678px;
        min-width: 678px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        margin: auto;
      }
    }

    .change {
      h2 {
        margin-top: 24px;
        text-align: left;
      }

      label {
        width: 327px;
      }

      .change-button {
        padding: 9px 24px;
        background: var(--status);
        color: var(--white);
        border: none;
        border-radius: 4px;
      }
    }

    .actions {
      margin-top: 50px;
    }
  }
}
</style>
