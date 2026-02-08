<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { TModal } from '@/store/types/modalTypes.ts'
import UIButton from '@/components/ui/UIButton.vue'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { TProvider } from '@/modules/buy/providers/store/types/providerTypes.ts'
import { parseEuroCurrency } from '@/lib/utils'

const modalStore = useModalStore()
const providersStore = useProvidersStore()
const batchStore = useBatchStore()
const { modal } = storeToRefs(modalStore)
const { providers } = storeToRefs(providersStore)
const selectedProvider = ref({} as TProvider)
const amount = ref('')
const errors = ref({} as any)

const compBalance = computed(() => {
  return ''
})

const submit = async () => {
  errors.value = {}
  let params = {
    type: 'credit',
    balance: parseEuroCurrency(amount.value),
  }
  if (!selectedProvider.value?.id) {
    errors.value.provider = 'Provider must be selected'
    return
  }
  const data = await providersStore.actionUpdateProviderBalance(
    selectedProvider.value?.id,
    params
  )
  if (data.response?.data?.status !== 400) {
    modalStore.setModal({} as TModal)
    await batchStore.actionGetBatchList()
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
  <div class="refill-modal flex flex-col">
    <h1>{{ $t('Payment') }}</h1>
    <div class="data-list flex flex-col gap-6">
      <SingleSelect
        @click="errors = {}"
        :error="errors.provider"
        :placeholder="`${$t('Provider')} *`"
        :data="providers.data"
        :show-key="'company'"
        :none="false"
        :selected="selectedProvider"
        @select="selectedProvider = $event"
      />
      <UIInput
        @update:model-value="errors = {}"
        :error="errors?.balance"
        :symbol="'€'"
        :placeholder="`${$t('Amount')} *`"
        v-model="amount"
        :type="'number'"
      />
      <div class="after-refill">
        <p class="subtitle">{{ compBalance }}</p>
      </div>
    </div>
    <div class="actions flex w-full justify-end gap-4">
      <UIButton @click="submit">{{ $t('Save') }}</UIButton>
      <UIButton
        type="button"
        types="cancel"
        @click="modalStore.setModal({} as TModal)"
        >{{ $t('Cancel') }}
      </UIButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.refill-modal {
  width: 475px;

  .data-list {
    padding-bottom: 24px;
    position: relative;

    .after-refill {
      position: absolute;
      bottom: 0;
    }
  }

  h1 {
    margin-bottom: 24px;
  }

  .actions {
    margin-top: 40px;
  }
}
</style>
