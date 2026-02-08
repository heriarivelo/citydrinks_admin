<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  TShipping,
  TShippingErrors,
} from '@/modules/others/shipping/store/types/shippingTypes.ts'
import { useShippingStore } from '@/modules/others/shipping/store/shipping.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { SHIPPING_TYPES } from '@/modules/others/shipping/constants.ts'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/lib/utils'
import { useModalStore } from '@/store/modal'

const shippingForm = ref({
  name: '',
  type: '',
  cost: '',
} as TShipping)
const errors = ref({})
const router = useRouter()
const route = useRoute()
const shippingStore = useShippingStore()
const { shipping } = storeToRefs(shippingStore)
const modalStore = useModalStore()
const selectedType = ref<any>({})

const submit = async () => {
  errors.value = {} as TShippingErrors
  shippingForm.value.type = selectedType.value?.id
  const data = await shippingStore.actionUpdateShipping(
    shippingForm.value.id,
    shippingForm.value
  )
  if (data.response?.data?.status !== 400) {
    modalStore.setIsFormDirty(false)
    await router.push('/admin/others/shipping')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
}

onMounted(async () => {
  await shippingStore.actionGetShippingById(Number(route.params.id))
  shippingForm.value = {
    id: shipping.value.id,
    name: shipping.value.name,
    cost: formatCurrency(shipping.value.cost, true, true),
  }
  selectedType.value =
    SHIPPING_TYPES.find((type: any) => type.id === shipping.value.type) || {}
})
</script>

<template>
  <div class="related-product-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Edit_Shipping') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <div class="content gap-4">
            <UIInput
              @click="errors = {} as TShippingErrors"
              @update:model-value="errors = {} as TShippingErrors"
              :error="errors[`name`]"
              :placeholder="`${$t('Name')} *`"
              v-model="shippingForm.name"
              :is-dirty="true"
            />
            <SingleSelect
              @click="errors = {} as TShippingErrors"
              @update:model-value="errors = {} as TShippingErrors"
              :data="SHIPPING_TYPES"
              :error="errors[`type`]"
              :placeholder="`${$t('Type')} *`"
              :selected="selectedType"
              @select="selectedType = $event"
              :is-dirty="true"
              :none="false"
            />
            <UIInput
              @click="errors = {} as TShippingErrors"
              @update:model-value="errors = {} as TShippingErrors"
              :error="errors[`cost`]"
              symbol="€"
              :placeholder="`${$t('Cost')} *`"
              v-model="shippingForm.cost"
              :is-dirty="true"
            />
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Save') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/others/shipping')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.related-product-create {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      position: relative;

      .icon-plus {
        color: var(--primary-500);
      }

      .content {
        display: grid;
        grid-template-columns: 203px 203px 203px 24px;
        align-items: center;
        width: 100%;
        margin: auto;
      }
    }
  }
}
</style>
