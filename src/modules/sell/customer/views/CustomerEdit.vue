<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useCustomerStore } from '@/modules/sell/customer/store/customer.ts'
import {
  TCustomer,
  TCustomerErrors,
} from '@/modules/sell/customer/store/types/customerTypes.ts'
import TariffSelect from '@/components/ui/selects/TariffSelect.vue'
import { TTariff } from '@/store/types/tariffTypes.ts'
import { storeToRefs } from 'pinia'
import { useTariffStore } from '@/store/tariff.ts'
import { TShipping } from '@/modules/others/shipping/store/types/shippingTypes.ts'
import { useShippingStore } from '@/modules/others/shipping/store/shipping.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { useModalStore } from '@/store/modal'
import { useQueryClient } from '@tanstack/vue-query'

const customerStore = useCustomerStore()
const shippingStore = useShippingStore()
const { customer } = storeToRefs(customerStore)
const { shippings } = storeToRefs(shippingStore)
const tariffStore = useTariffStore()
const { tariffs } = storeToRefs(tariffStore)
const router = useRouter()
const route = useRoute()
const customerInit = {} as TCustomer
const errors = ref({} as TCustomerErrors)
const customerForm = ref(JSON.parse(JSON.stringify(customerInit)))
const selectedTariff = ref({} as TTariff)
const selectedShipping = ref({} as TShipping)
const modalStore = useModalStore()
const queryClient = useQueryClient()
const isSubmitting = ref(false)

const submit = async () => {
  isSubmitting.value = true
  errors.value = {} as TCustomerErrors
  customerForm.value.tariff_id = selectedTariff.value?.id
  customerForm.value.shipping_id = selectedShipping.value?.id
  customerForm.value.phone_number = customerForm.value.phone
  const payload: any = { ...customerForm.value }
  if (!payload.password) {
    delete payload.password
  }
  const data = await customerStore.actionUpdateCustomer(payload)
  if (data.response?.data?.status !== 400) {
    customerForm.value = JSON.parse(JSON.stringify(customerInit))
    modalStore.setIsFormDirty(false)
    queryClient.invalidateQueries({
      queryKey: ['customers'],
    })
    await router.push('/admin/sell/customers')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
  isSubmitting.value = false
}

onMounted(async () => {
  await customerStore.actionGetCustomerById(Number(route.params.id))
  await tariffStore.actionGetTariffs()
  await shippingStore.actionGetShippings({
    page: 1,
    per_page: 999999,
  })
  selectedTariff.value = tariffs.value.data.filter(
    (item) => item.id === customer.value.tariffs.data[0]?.id
  )[0]
  selectedShipping.value = shippings.value.data.filter(
    (item) => item.id === customer.value.shipping?.data?.id
  )[0]
  customerForm.value = {
    ...customer.value,
    tariff_id: selectedTariff.value?.id ?? '',
    shipping_id: selectedShipping.value?.id ?? '',
  }
})
</script>

<template>
  <div class="customer-edit flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Edit_Customer') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="content gap-x-6 gap-y-4">
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.company"
            :placeholder="`${$t('Company')} *`"
            v-model="customerForm.company"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.email"
            :input-type="'email'"
            :placeholder="`${$t('Email')} *`"
            v-model="customerForm.email"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.user_name"
            :placeholder="`${$t('Username')} *`"
            v-model="customerForm.user_name"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.phone_number ?? errors.phone"
            :placeholder="$t('Phone_Number')"
            v-model="customerForm.phone"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.address"
            :placeholder="`${$t('Address')} *`"
            v-model="customerForm.address"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.vat"
            :placeholder="$t('VAT')"
            v-model="customerForm.vat"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.first_name"
            :placeholder="$t('First_Name')"
            v-model="customerForm.first_name"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.last_name"
            :placeholder="$t('Last_Name')"
            v-model="customerForm.last_name"
            :is-dirty="true"
          />
          <UIInput
            @click="errors = {} as TCustomerErrors"
            :error="errors.password"
            :placeholder="$t('Password')"
            v-model="customerForm.password"
            :is-dirty="true"
            :input-type="'text'"
          />
          <TariffSelect
            :selected="selectedTariff"
            @click="errors = {} as TCustomerErrors"
            @select="selectedTariff = $event"
            :show-delete-button="true"
            :hide-edit-delete="true"
          />

          <SingleSelect
            @click="errors = {} as TCustomerErrors"
            :error="errors.shipping_id"
            :data="shippings.data"
            @select="selectedShipping = $event"
            :selected="selectedShipping"
            :placeholder="`${$t('Shipping_Name')}*`"
            :is-dirty="true"
          />
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton :disabled="isSubmitting">{{ $t('Save') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/sell/customers')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.customer-edit {
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
