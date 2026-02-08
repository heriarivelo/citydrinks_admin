<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePromotionStore } from '@/modules/sell/promotion/store/promotion.ts'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import IconDelete from '@/components/icons/IconDelete.vue'
import UITable from '@/components/table/UITable.vue'
import { PROMOTION_TYPES_BY_ID } from '@/modules/sell/promotion/constants.ts'
import UIButton from '@/components/ui/UIButton.vue'
import { TPromotion } from '@/modules/sell/promotion/store/types/promotionTypes.ts'
import dayjs from '@/lib/dayjs'
import { formatCurrency } from '@/lib/utils'

const promotionStore = usePromotionStore()
const route = useRoute()
const { promotion } = storeToRefs(promotionStore)
const promotionForm = ref({
  name: '',
  start_date: '',
  end_date: '',
  products: [
    {
      product_id: '',
      type: '',
      amount: '',
    },
  ],
} as TPromotion)

const removeProduct = async (index: number) => {
  promotionForm.value.products.splice(index, 1)
  await promotionStore.actionUpdatePromotion(promotionForm.value)
  await updateValue()
}

const updateValue = async () => {
  await promotionStore.actionGetPromotionById(Number(route.params.id))
  promotionForm.value = {
    id: promotion.value?.id,
    name: promotion.value?.name,
    start_date: promotion.value?.start_date,
    end_date: promotion.value?.end_date,
    products: promotion.value?.products?.map((item: any) => ({
      product_id: item.pivot.product_id,
      type: item.pivot.type,
      amount: Number(item.pivot.amount),
    })),
  }
}

onMounted(async () => {
  await updateValue()
})
</script>

<template>
  <div class="promotion">
    <div class="header flex justify-between">
      <div class="flex gap-2">
        <h2 class="neutral">{{ $t('Promotion') }}:</h2>
        <h3 class="gray">{{ promotion.name }}</h3>
      </div>
      <div class="flex gap-6">
        <div class="flex gap-2">
          <h3 class="neutral">{{ $t('Status') }}:</h3>
          <p class="body-text gray">
            {{
              dayjs(promotion?.end_date, 'DD-MM-YYYY').isBefore(dayjs())
                ? $t('Past')
                : $t('Current')
            }}
          </p>
        </div>
        <div class="flex gap-2">
          <h3 class="neutral">{{ $t('Start_Date') }}:</h3>
          <p class="body-text gray">{{ promotion?.start_date }}</p>
        </div>
        <div class="flex gap-2">
          <h3 class="neutral">{{ $t('End_Date') }}:</h3>
          <p class="body-text gray">{{ promotion?.end_date }}</p>
        </div>
      </div>
    </div>
    <UITable>
      <template v-slot:thead>
        <tr>
          <td>{{ $t('ID') }}</td>
          <td>{{ $t('Promotion') }}</td>
          <td>{{ $t('Type') }}</td>
          <td>{{ $t('Amount') }}</td>
          <td>{{ $t('Final_Price') }}</td>
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr v-for="(product, index) in promotion.products">
          <td>{{ product?.id }}</td>
          <td>{{ product?.name }}</td>
          <td>{{ PROMOTION_TYPES_BY_ID[product?.pivot.type] }}</td>
          <td>
            {{ Number(product?.pivot.amount) }}
            {{ product?.pivot.type == 1 ? '%' : ' Euro' }}
          </td>
          <td>
            {{
              product?.pivot.type == 1
                ? formatCurrency(
                    Number(product.price_per_pack) -
                      (Number(product.price_per_pack) / 100) *
                        Number(product.pivot.amount)
                  )
                : formatCurrency(
                    Number(product.price_per_pack) -
                      Number(product.pivot.amount)
                  )
            }}
          </td>
          <td>
            <div class="flex justify-center gap-1">
              <IconDelete
                class="cursor-pointer"
                @click="removeProduct(index)"
              />
            </div>
          </td>
        </tr>
      </template>
    </UITable>
    <div class="actions flex w-full justify-end">
      <UIButton
        type="button"
        types="cancel"
        @click="$router.push('/admin/sell/promotion')"
      >
        {{ $t('Go_Back') }}
      </UIButton>
    </div>
  </div>
</template>

<style scoped>
.promotion {
  padding: 32px;

  .header {
    margin-bottom: 25px;

    .neutral {
      color: var(--neutral-400);
    }

    .gray {
      color: var(--gray-300);
    }
  }

  .actions {
    margin-top: 50px;
  }
}
</style>
