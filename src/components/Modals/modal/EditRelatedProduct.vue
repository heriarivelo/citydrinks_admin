<script setup lang="ts">
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { TModal } from '@/store/types/modalTypes.ts'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import {
  TRelatedErrors,
  TRelatedProduct,
} from '@/modules/others/relatedProduct/store/types/relatedTypes.ts'
import { onMounted, ref } from 'vue'
import { formatCurrency, parseEuroCurrency } from '@/lib/utils'

const relatedStore = useRelatedStore()
const modalStore = useModalStore()
const { modal } = storeToRefs(modalStore)
const errors = ref({} as TRelatedErrors)
const related = ref({} as TRelatedProduct)

const submit = async () => {
  const params = {
    id: related.value.id,
    name: related.value.name,
    price: parseEuroCurrency(related.value.price),
    cost_price: parseEuroCurrency(related.value.cost_price),
    related_with: related.value.related_with,
  }
  const data = await relatedStore.actionUpdateRelatedProduct(params)
  if (data?.response?.data?.status !== 400) {
    modalStore.setModal({} as TModal)
    await relatedStore.actionGetRelatedProducts()
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
}

onMounted(() => {
  related.value = {
    id: modal.value.data.related_product.id,
    name: modal.value.data.related_product.name,
    price: formatCurrency(modal.value.data.related_product.price, true, true),
    cost_price: formatCurrency(
      modal.value.data.related_product.cost_price,
      true,
      true
    ),
    related_with: modal.value.data.related_product.related_with,
  } as TRelatedProduct
})
</script>

<template>
  <div class="edit-related-content flex flex-col gap-10">
    <div class="flex flex-col gap-6">
      <h1 class="uppercase">{{ $t('Edit_related_product') }}</h1>
      <div class="content flex flex-col gap-4">
        <UIInput
          @click="errors = {} as TRelatedErrors"
          @update:model-value="errors = {} as TRelatedErrors"
          :error="errors.name"
          :placeholder="`${$t('Product_name')} *`"
          v-model="related.name"
        />
        <UIInput
          @click="errors = {} as TRelatedErrors"
          @update:model-value="errors = {} as TRelatedErrors"
          :error="errors.price"
          :placeholder="`${$t('Cost')} *`"
          v-model="related.cost_price"
          symbol="€"
        />
        <UIInput
          @click="errors = {} as TRelatedErrors"
          @update:model-value="errors = {} as TRelatedErrors"
          :error="errors.cost_price"
          :placeholder="`${$t('Price')} *`"
          v-model="related.price"
          symbol="€"
        />
      </div>
    </div>
    <div class="actions flex w-full justify-end gap-4">
      <UIButton @click="submit">{{ $t('Save') }}</UIButton>
      <UIButton types="cancel" @click="modalStore.setModal({} as TModal)">{{
        $t('Cancel')
      }}</UIButton>
    </div>
  </div>
</template>

<style scoped>
.edit-related-content {
  width: 411px;
}
</style>
