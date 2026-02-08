<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { TProviderErrors } from '@/modules/buy/providers/store/types/providerTypes.ts'
import { useModalStore } from '@/store/modal'
import { useQueryClient } from '@tanstack/vue-query'

const providersStore = useProvidersStore()
const router = useRouter()

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
const queryClient = useQueryClient()

const submit = async () => {
  errors.value = {} as TProviderErrors
  const data = await providersStore.actionCreateProviders(providerForm.value)
  if (data.status == 201) {
    providerForm.value = JSON.parse(JSON.stringify(providerInit))
    modalStore.setIsFormDirty(false)
    queryClient.invalidateQueries({
      queryKey: ['providers'],
    })
    await router.push('/admin/buy/providers')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
}
</script>

<template>
  <div class="product-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_Provider') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="content gap-x-6 gap-y-4">
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.company"
            :placeholder="`${$t('Company')} *`"
            v-model="providerForm.company"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :input-type="'email'"
            :error="errors.email"
            :placeholder="$t('Email')"
            v-model="providerForm.email"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.user_name"
            :placeholder="$t('Username')"
            v-model="providerForm.user_name"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.phone_number"
            :placeholder="$t('Phone_Number')"
            v-model="providerForm.phone_number"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.address"
            :placeholder="$t('Address')"
            v-model="providerForm.address"
            :is-dirty="true"
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
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TProviderErrors"
            :error="errors.last_name"
            :placeholder="$t('Last_Name')"
            v-model="providerForm.last_name"
            :is-dirty="true"
          />
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Create') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/buy/providers')"
            >{{ $t('Go_Back') }}</UIButton
          >
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-create {
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
