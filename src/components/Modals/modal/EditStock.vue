<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { onMounted, ref } from 'vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { STOCK_NAME } from '@/modules/stocks/constants.ts'
import UIButton from '@/components/ui/UIButton.vue'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import { TModal } from '@/store/types/modalTypes.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { TStock, TStockError } from '@/modules/stocks/store/types/stockTypes.ts'

const modalStore = useModalStore()
const stockStore = useStockStore()
const { modal } = storeToRefs(modalStore)
const errors = ref({} as TStockError)
const selected = ref(STOCK_NAME[0])
const stock = ref({} as TStock)

const submit = async () => {
  const data = await stockStore.actionUpdateStock(
    {
      name: stock.value.name,
      type: selected.value.value,
    },
    modal.value.data.id
  )
  if (data.response?.data?.status !== 400) {
    await stockStore.actionGetStocks()
    modalStore.setModal({} as TModal)
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
}

onMounted(async () => {
  const data = await stockStore.actionGetStock(modal.value.data.id)
  stock.value = data.data
})
</script>

<template>
  <div class="create-stock">
    <h1>{{ $t('Edit_stock') }}</h1>
    <form action="" class="flex flex-col gap-10" @submit.prevent="submit">
      <div class="flex flex-col gap-5">
        <UIInput
          @update:model-value="errors = {} as TStockError"
          :error="errors.name"
          :placeholder="`${$t('Stock_name')} *`"
          v-model="stock.name"
        />
        <SingleSelect
          :none="false"
          :data="STOCK_NAME"
          :selected-key="'value'"
          @select="selected = $event"
          :selected="selected"
          :placeholder="`${$t('Status')} *`"
        />
      </div>
      <div class="actions flex w-full justify-end gap-4">
        <UIButton>{{ $t('Save') }}</UIButton>
        <UIButton
          type="button"
          types="cancel"
          @click="modalStore.setModal({} as TModal)"
          >{{ $t('Go_Back') }}
        </UIButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-stock {
  min-width: 411px;

  h1 {
    margin-bottom: 24px;
  }
}
</style>
