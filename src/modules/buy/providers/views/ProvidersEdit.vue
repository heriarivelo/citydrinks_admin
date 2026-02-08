<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { storeToRefs } from 'pinia'
import { TProviderErrors } from '@/modules/buy/providers/store/types/providerTypes.ts'
import { useModalStore } from '@/store/modal'
import { useQueryClient } from '@tanstack/vue-query'

const providersStore = useProvidersStore()
const { provider } = storeToRefs(providersStore)
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const providerInit = {
  role_id: '',
  user_name: '',
  email: '',
  phone_number: '',
  first_name: '',
  last_name: '',
}

const errors = ref({} as TProviderErrors)
const modalStore = useModalStore()
const providerForm = ref(JSON.parse(JSON.stringify(providerInit)))

const submit = async () => {
  errors.value = {} as TProviderErrors
  const data = await providersStore.actionUpdateProviders(providerForm.value)
  if (data?.response?.data?.errors) {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  } else {
    modalStore.setIsFormDirty(false)
    queryClient.invalidateQueries({
      queryKey: ['providers'],
    })
    await router.push('/admin/buy/providers')
  }
}

onMounted(async () => {
  await providersStore.actionGetProviderById(Number(route.params.id))
  providerForm.value = {
    ...providerForm.value,
    ...provider.value,
  }
})
</script>

<template>
  <div class="provider-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Edit_Provider') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="content gap-x-6 gap-y-4">
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.company"
            :placeholder="`${$t('Company')} *`"
            v-model="providerForm.company"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :input-type="'email'"
            :error="errors.email"
            :placeholder="$t('Email')"
            v-model="providerForm.email"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.user_name"
            :placeholder="$t('Username')"
            v-model="providerForm.user_name"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.phone_number"
            :placeholder="$t('Phone_Number')"
            v-model="providerForm.phone_number"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.address"
            :placeholder="$t('Address')"
            v-model="providerForm.address"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.vat"
            :placeholder="$t('VAT')"
            v-model="providerForm.vat"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.first_name"
            :placeholder="$t('First_Name')"
            v-model="providerForm.first_name"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.last_name"
            :placeholder="$t('Last_Name')"
            v-model="providerForm.last_name"
          />
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Save') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/buy/providers')"
            >{{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.provider-create {
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
  }
}
</style>
