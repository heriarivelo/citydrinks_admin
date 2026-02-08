<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { ref } from 'vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { STOCK_NAME } from '@/modules/stocks/constants.ts'
import UIButton from '@/components/ui/UIButton.vue'
import { useModalStore } from '@/store/modal.ts'
import { TModal } from '@/store/types/modalTypes.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { TStockError } from '@/modules/stocks/store/types/stockTypes.ts'

const modalStore = useModalStore()
const stockStore = useStockStore()
const errors = ref({} as TStockError)
const selected = ref(STOCK_NAME[0])
const name = ref('')

const submit = async () => {
  const data = await stockStore.actionCreateStock({
    name: name.value,
    type: selected.value.value,
  })
  if (data.status == 201) {
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
</script>

<template>
  <div class="create-stock">
    <h1>{{ $t('Create_a_new_stock') }}</h1>
    <form action="" class="flex flex-col gap-10" @submit.prevent="submit">
      <div class="flex flex-col gap-5">
        <UIInput
          @update:model-value="errors = {} as TStockError"
          :error="errors.name"
          :placeholder="`${$t('Stock_name')} *`"
          v-model="name"
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
        <UIButton>{{ $t('Create') }}</UIButton>
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
