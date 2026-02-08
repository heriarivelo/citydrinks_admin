<script setup lang="ts">
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIRadioInput from '@/components/ui/inputs/UIRadioInput.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UIButton from '@/components/ui/UIButton.vue'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import { useRoute } from 'vue-router'
import { TModal } from '@/store/types/modalTypes.ts'
import { useQueryClient } from '@tanstack/vue-query'

const { t } = useI18n()
const modalStore = useModalStore()
const batchStore = useBatchStore()
const { modal } = storeToRefs(modalStore)
const reason = ref(t('reason_1'))
const reasonText = ref('')
const focus = ref(false)
const route = useRoute()
const queryClient = useQueryClient()

const compQuantity = computed(() => {
  return `${Math.trunc(modal.value.data.quantity / modal.value.data.packs_quantity_per_pallet)} PL ${modal.value.data.quantity % modal.value.data.packs_quantity_per_pallet} PK`
})

const submit = async () => {
  await batchStore.actionUpdateBatchItems(
    {
      expiry_date: modal.value.data.expiry_date,
      available_date: modal.value.data.available_date,
      quantity: modal.value.data.quantity || 0,
      reason: reasonText.value ? reasonText.value : reason.value,
    },
    modal.value.data.id
  )
  await batchStore.actionGetBatchListByStockAndProduct({
    stock_id: route.params.stock,
    product_id: route.params.product_id,
  })
  queryClient.invalidateQueries({
    queryKey: ['stocks'],
  })
  modalStore.setModal({} as TModal)
}
</script>

<template>
  <div class="edit-product-reason">
    <p class="h1">{{ $t('Mention_Editing_Reason') }}</p>
    <div class="data-row">
      <UIInputDate
        :placeholder="`${$t('Expire_Date')}`"
        v-model="modal.data.expiry_date"
      />
      <UIInputDate
        :placeholder="`${$t('Availability_date')}`"
        v-model="modal.data.available_date"
      />
      <UIInput
        @update:model-value="modal.data.quantity = $event"
        :model-value="!focus ? compQuantity : modal.data.quantity"
        @update:focus="focus = $event"
        :placeholder="`${$t('QNT__(Pack)')}`"
      />
    </div>
    <div class="radio flex flex-col gap-2">
      <UIRadioInput
        v-model="reason"
        :label="$t('reason_1')"
        :name="'reason'"
        :inputValue="$t('reason_1')"
      />
      <UIRadioInput
        v-model="reason"
        :label="$t('reason_2')"
        :name="'reason'"
        :inputValue="$t('reason_2')"
      />
      <UIRadioInput
        v-model="reason"
        :label="$t('reason_3')"
        :name="'reason'"
        :inputValue="$t('reason_3')"
      />
    </div>
    <div class="text">
      <textarea
        class="body-text"
        :placeholder="$t('Write_a_reason')"
        :disabled="reason != $t('reason_3')"
        v-model="reasonText"
      />
    </div>
    <div class="actions flex w-full justify-end gap-4">
      <UIButton @click="submit">{{ $t('Save') }}</UIButton>
      <UIButton
        type="button"
        types="cancel"
        @click="modalStore.setModal({} as TModal)"
      >
        {{ $t('Cancel') }}
      </UIButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-product-reason {
  width: 539px;

  .h1 {
    margin-bottom: 24px;
  }

  .data-row {
    display: grid;
    grid-template-columns: 164.5px 164.5px 128px;
    gap: 9px;
    margin-bottom: 24px;
  }

  .radio {
    margin-bottom: 24px;
  }

  .text {
    margin-bottom: 40px;

    textarea {
      padding: 12px 44px;
      width: 100%;
      resize: none;
      border: 1px solid var(--neutral-200);
      border-radius: 4px;

      &:focus-visible {
        outline: none;
      }
    }
  }
}
</style>
