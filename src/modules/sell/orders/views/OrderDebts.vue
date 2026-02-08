<script setup lang="ts">
import { fetchDebts } from '@/api/debt'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import NoData from '@/components/table/NoData.vue'
import UITable from '@/components/table/UITable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatCurrency, parseNumber } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { Expand } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const currentPage = ref(1)

const { fullScreenType } = defineProps<{
  fullScreenType: string
}>()

const pageChange = (page: number) => {
  currentPage.value = page
}

const { data: debts } = useQuery({
  queryKey: [
    'debts',
    {
      page: currentPage,
      per_page: 10,
    },
  ],
  queryFn: () =>
    fetchDebts({
      page: currentPage.value,
      per_page: 10,
    }),
  placeholderData: keepPreviousData,
})

onMounted(async () => {})
</script>

<template>
  <div
    v-if="!fullScreenType || fullScreenType === 'debt'"
    rr
    class="flex flex-col gap-4"
  >
    <h2 class="uppercase">{{ $t('Debt') }}</h2>
    <div class="custom-scrollbar max-h-[204px] overflow-y-auto">
      <UITable>
        <template v-slot:thead>
          <tr>
            <td>{{ $t('ID') }}</td>
            <td>{{ $t('Customer') }}</td>
            <td>{{ $t('Pallet') }}</td>
            <td>{{ $t('Pack') }}</td>
            <td>{{ $t('Total_Price') }}</td>
            <td>{{ $t('Paid') }}</td>
            <td>{{ $t('Balance') }}</td>
            <td class="w-[145px]">
              <div class="flex justify-end gap-2">
                {{ $t('Actions') }}
                <RouterLink
                  to="debts"
                  :class="
                    buttonVariants({
                      variant: 'ghost',
                      size: 'iconSm',
                      class: 'bg-background',
                    })
                  "
                >
                  <Expand color="var(--primary-700)" />
                </RouterLink>
              </div>
            </td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr v-if="debts?.data?.length" v-for="order in debts?.data">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.pallet }}</td>
            <td>{{ order.pack }}</td>
            <td>{{ formatCurrency(order.total_price) }}</td>
            <td>{{ formatCurrency(order.paid_amount) }}</td>
            <td class="!text-red-600">
              {{ formatCurrency(order.sold) }}
            </td>
            <td class="!py-0">
              <div class="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="iconMd"
                  class="text-[var(--neutral-400)]"
                >
                  <PaymentDialog
                    icon="wallet"
                    :payment-item="{
                      order_id: order.id,
                      balance: parseNumber(order.sold),
                      company: order.customer,
                    }"
                  />
                </Button>
              </div>
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </div>
    <Pagination
      :currentPage="currentPage || 1"
      :totalPages="debts?.meta?.last_page"
      v-if="debts?.meta?.last_page > 1"
      @page-change="pageChange"
    />
  </div>
</template>
