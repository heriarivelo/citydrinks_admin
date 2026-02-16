<script setup lang="ts">
import { fetchPayments } from '@/api/payment'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { formatCurrency, parseNumber } from '@/lib/utils'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { PaymentType } from '@/types/globalTypes'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { useDebounceFn } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NoData from '../table/NoData.vue'
import PaymentItem from './PaymentItem.vue'

const stockStore = useStockStore()
const isNewPaymentDialogOpen = ref(0)
const route = useRoute()
const router = useRouter()
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(null)

const paymentType = computed(
  () => route.path.split('/').slice(-2, -1)[0] as PaymentType
)

/**
 * UIInputDate (flatpickr) affiche/émet "dd-mm-YYYY" (dateFormat: d-m-Y)
 * Backend/API attend "YYYY-MM-DD" (ISO)
 */
const toIsoDate = (dmy: string): string => {
  const v = String(dmy || '').trim()
  if (!v) return ''
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!m) return ''
  const [, dd, mm, yyyy] = m
  return `${yyyy}-${mm}-${dd}`
}

const toDisplayDate = (iso: string): string => {
  const v = String(iso || '').trim()
  if (!v) return ''
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ''
  const [, yyyy, mm, dd] = m
  return `${dd}-${mm}-${yyyy}`
}

// ✅ States ISO
const startDate = ref<string>('') // YYYY-MM-DD
const endDate = ref<string>('') // YYYY-MM-DD

// ✅ Values affichées dans l’input (dd-mm-YYYY)
const displayStartDate = computed(() =>
  startDate.value ? toDisplayDate(startDate.value) : ''
)
const displayEndDate = computed(() =>
  endDate.value ? toDisplayDate(endDate.value) : ''
)

watch(isNewPaymentDialogOpen, (newValue) => {
  document.body.style.overflow = newValue ? 'hidden' : ''
})

const params = computed(() => ({
  page: route.query.page || 1,
  search: route.query.search,
  // ✅ nouveau standard
  start_date: route.query.start_date,
  end_date: route.query.end_date,
  ['sort[]']: route.query['sort[]'],
}))

const { data: paymentsData, isFetching, refetch } = useQuery({
  queryKey: [`payments-${paymentType.value}`, params],
  queryFn: () => fetchPayments({ params: params.value, type: paymentType.value }),
  placeholderData: keepPreviousData,
})

const pageChange = async (page: number) => {
  router.push({ query: { ...route.query, page } })
  scrollContainerRef.value?.scrollToTop()
}

const pushDateQuery = () => {
  router.push({
    query: {
      ...route.query,
      page: 1,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
    },
  })
}

const updateStartDate = (value: string) => {
  startDate.value = toIsoDate(value)
  pushDateQuery()
}

const updateEndDate = (value: string) => {
  endDate.value = toIsoDate(value)
  pushDateQuery()
}

const handleSearch = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  debouncedSearch(value)
}

const debouncedSearch = useDebounceFn((value: string) => {
  router.push({
    query: { ...route.query, search: value || undefined },
  })
}, 300)

onMounted(async () => {
  await stockStore.actionGetStocks()

  // ✅ Nouveau format URL: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  if (typeof route.query.start_date === 'string') {
    startDate.value = route.query.start_date
  }
  if (typeof route.query.end_date === 'string') {
    endDate.value = route.query.end_date
  }

  // ✅ Ancien format URL: ?start_date[]=YYYY-MM-DD&start_date[]=YYYY-MM-DD
  if (Array.isArray(route.query.start_date)) {
    startDate.value = route.query.start_date[0] || ''
    endDate.value = route.query.start_date[1] || ''
  }
})

watch(paymentType, async () => {
  // reset dates quand on change buy/sell
  startDate.value = ''
  endDate.value = ''

  if (route.query.page !== '1') {
    router.push({ query: { page: 1 } })
  } else {
    refetch()
  }
})

watch(isFetching, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div class="stock flex h-fit min-h-full flex-col gap-[26px]">
    <div class="header flex justify-between">
      <div class="flex gap-3">
        <UIInputDate
          :placeholder="$t('Start_date')"
          :model-value="displayStartDate"
          @update:model-value="updateStartDate"
        />

        <UIInputDate
          :placeholder="$t('End_date')"
          :model-value="displayEndDate"
          @update:model-value="updateEndDate"
        />
      </div>

      <div class="flex gap-4">
        <UIInput
          icon="search"
          :placeholder="
            $t(paymentType === 'buy' ? 'Search_by_Provider' : 'Search_by_Customer')
          "
          :model-value="route.query.search as string"
          @input="handleSearch"
          input-class="!w-[230px]"
        />
        <PaymentDialog />
      </div>
    </div>

    <ScrollContainer ref="scrollContainerRef" storage-key="buy-payment">
      <UITable>
        <template v-slot:thead>
          <tr>
            <td>{{ $t('NN') }}</td>
            <td>{{ $t('Date') }}</td>
            <td v-if="paymentType === 'buy'">{{ $t('Provider') }}</td>
            <td v-else>{{ $t('Customer') }}</td>
            <td>{{ $t('Document_Purpose') }}</td>
            <td v-if="paymentType === 'buy'">{{ $t('Batch_IC') }}</td>
            <td v-else class="whitespace-nowrap">{{ $t('Order_ID') }}</td>
            <td>{{ $t('Total_Sum') }}</td>
            <td>{{ $t('Paid') }}</td>
            <td>{{ $t('Balance') }}</td>
            <td class="w-36 text-center">{{ $t('Actions') }}</td>
            <td class="w-10 !px-0"></td>
          </tr>
        </template>

        <template v-slot:t-row>
          <tr v-if="paymentsData?.data?.length" v-for="paymentItem in paymentsData?.data">
            <PaymentItem :payment-item="paymentItem" />
          </tr>
          <NoData v-else />
        </template>

        <template v-slot:tfoot>
          <tr>
            <td></td>
            <td>{{ $t('Total') }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              {{
                formatCurrency(
                  paymentsData?.data.reduce(
                    (acc, item) => acc + parseNumber(item.amount),
                    0
                  )
                )
              }}
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </template>
      </UITable>
    </ScrollContainer>

    <Pagination
      :currentPage="Number(route.query.page) || 1"
      :totalPages="paymentsData?.meta?.last_page"
      v-if="paymentsData?.meta?.last_page > 1"
      @page-change="pageChange"
    />
  </div>
</template>

<style scoped>
.stock {
  padding: 32px;

  .icon-buttons {
    padding: 7px 9px;
    border: 1px solid var(--neutral-200);
    box-shadow: 0 0 10px 0 #d5d8e6;
    border-radius: 4px;
  }

  .export-import-block {
    position: relative;
  }

  .export-import {
    min-width: 200px;
    color: var(--neutral-200);
    position: absolute;
    top: 100%;
    right: 0;
    box-shadow: 0 0 10px 0 #d5d8e6;
    background: var(--white);
    padding: 10px 16px;
    border-radius: 4px;
    z-index: 10;
  }
}
</style>
