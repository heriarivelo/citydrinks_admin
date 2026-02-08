<script setup lang="ts">
import IconFIlter24 from '@/components/icons/IconFIlter24.vue'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import CheckboxInput from '@/components/ui/inputs/CheckboxInput.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import Pagination from '@/components/ui/Pagination.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { cn, formatCurrency, parseNumber, sortTable } from '@/lib/utils'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { TProvider } from '@/modules/buy/providers/store/types/providerTypes.ts'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { BatchStatus, PaymentType } from '@/types/globalTypes'
import { useQueryClient } from '@tanstack/vue-query'
import { Eye, Pencil, TriangleAlert, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const queryClient = useQueryClient()
const loaded = ref(false)
const batchStore = useBatchStore()
const providersStore = useProvidersStore()
const stockStore = useStockStore()
const { stocks } = storeToRefs(stockStore)
const { providers } = storeToRefs(providersStore)
const { batches, query } = storeToRefs(batchStore)
const selectedProvider = ref({} as TProvider)
const tabFilter = ref('store')
const open = ref(false)
const clear = ref(false)
const date = ref('')
const searchInp = ref('')
const selectedStockIds = ref([])
const selectedBatchStatus = ref<{ id: number; status: BatchStatus }>(null)
const searchValue = ref('')
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)
const route = useRoute()
const paymentType = computed(
  () => route.path.split('/').slice(-2, -1)[0] as PaymentType
)

const search = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  searchValue.value = value
  if (value) {
    query.value = {
      ...query.value,
      page: 1,
      all: value,
    }
  } else {
    delete query.value['all']
  }
  loaded.value = false
  await batchStore.actionGetBatchList()
  loaded.value = true
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => batchStore.actionGetBatchList())
}

const updateFilterDate = async (event: any) => {
  if (event) {
    date.value = event
  } else {
    date.value = ''
  }
}

const openFilter = () => {
  open.value = !open.value
  if (open.value) {
    setTimeout(() => {
      window.addEventListener('click', closeSelect)
    })
  } else {
    closeSelect()
  }
}

const closeSelect = (event: Event | null = null) => {
  let target
  if (event) target = event.target as HTMLInputElement
  if (
    !event ||
    !target?.closest('.filter-block-content') ||
    target?.closest('.cancel-button')
  ) {
    open.value = false
    window.removeEventListener('click', closeSelect)
  }
}

const selectProvider = async (e) => {
  selectedProvider.value = e
  query.value = {
    ...query.value,
    provider_id: selectedProvider.value?.id,
  }
  await batchStore.actionGetBatchList()
}

const updateBatchStatus = async () => {
  await batchStore.actionUpdateBatchStatus(
    {
      [selectedBatchStatus.value.status]: 1,
    },
    selectedBatchStatus.value.id
  )
  selectedBatchStatus.value = null
  queryClient.invalidateQueries({
    queryKey: ['providers'],
  })
  queryClient.invalidateQueries({
    queryKey: ['batch-history'],
  })
  queryClient.invalidateQueries({
    queryKey: ['payments-buy'],
  })
  queryClient.invalidateQueries({
    queryKey: ['stocks'],
  })
  batchStore.actionGetBatchList()
}

const checkedStocks = (e, id: string | number) => {
  if (e && !selectedStockIds.value.includes(id)) {
    selectedStockIds.value.push(id)
  } else {
    const index = selectedStockIds.value.indexOf(id)
    selectedStockIds.value.splice(index, 1)
  }
}

const pageChange = async (page: number) => {
  query.value.page = page
  await batchStore.actionGetBatchList()
  scrollContainerRef.value?.scrollToTop()
}

const resetFilter = async () => {
  selectedStockIds.value = []
  date.value = ''
  clear.value = true
  setTimeout(() => {
    clear.value = false
  })
  delete query.value.stock_id
  delete query.value.created_at
  await batchStore.actionGetBatchList()
  closeSelect()
}

const apply = async () => {
  if (selectedStockIds.value.length) {
    query.value.stock_id = '[in]' + selectedStockIds.value.join(',')
  } else if (!selectedStockIds.value.length) {
    delete query.value.stock_id
  }
  if (date.value.length) {
    query.value.created_at = '[between]' + date.value
  } else if (!date.value.length) {
    delete query.value.created_at
  }

  await batchStore.actionGetBatchList()
  closeSelect()
}

const compStocks = computed(() => {
  return stocks.value.filter((item) => {
    return item.name.toLowerCase().includes(searchInp.value.toLowerCase())
  })
})

onMounted(async () => {
  batchStore.$reset()
  await batchStore.actionGetBatchList()
  providersStore.$reset()
  await providersStore.actionGetProviders({ per_page: 999 })
  loaded.value = true
})

onUnmounted(() => {
  providersStore.$reset()
  delete query.value['all']
})

watch(batches, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div class="stock flex h-fit min-h-full flex-col gap-[26px]">
    <AlertDialog :open="selectedBatchStatus ? true : false">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ $t('Update_Batch_Status') }}</AlertDialogTitle>
          <AlertDialogDescription
            class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
          >
            <TriangleAlert
              class="mt-1 shrink-0 text-secondary"
              stroke-width="2.5"
            />
            <span class="text-justify">
              Are you sure you want to update the status
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button class="w-[6.375rem]" @click="updateBatchStatus">Save</Button>
          <AlertDialogCancel
            class="w-[6.375rem]"
            @click="selectedBatchStatus = null"
            >Cancel</AlertDialogCancel
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div class="batch flex flex-col gap-[26px]">
      <div class="header flex justify-between">
        <div class="provider-select flex">
          <SingleSelect
            class="w-full"
            :placeholder="$t('Provider')"
            :data="providers.data"
            :show-key="'company'"
            :selected="selectedProvider"
            @select="selectProvider"
          />
        </div>
        <div class="flex gap-4">
          <UIInput
            v-model="searchValue"
            :placeholder="$t('Search')"
            @input="search"
          />
          <div class="filter-block">
            <Button
              variant="outline"
              size="iconLg"
              class="size-[42px]"
              @click="openFilter"
            >
              <IconFIlter24 />
            </Button>
            <div class="filter-block-content flex flex-col" v-if="open">
              <div class="header flex justify-end">
                <Button
                  type="button"
                  variant="muted"
                  size="iconSm"
                  class="translate-x-1 rounded-full"
                  @click="closeSelect()"
                >
                  <X />
                </Button>
              </div>
              <div class="tabs flex items-center gap-4">
                <div
                  class="tab-item body-text cursor-pointer"
                  :class="{ active: tabFilter === 'store' }"
                  @click="tabFilter = 'store'"
                >
                  {{ $t('Store') }}
                </div>
                <div
                  class="tab-item body-text cursor-pointer"
                  :class="{ active: tabFilter === 'date' }"
                  @click="tabFilter = 'date'"
                >
                  {{ $t('Date') }}
                </div>
              </div>
              <template v-if="tabFilter === 'store'">
                <div class="reset-content flex flex-col items-end gap-5">
                  <button @click="resetFilter">
                    {{ $t('Reset_Filters') }}
                  </button>
                  <UIInput
                    :icon="'search'"
                    :placeholder="$t('Search')"
                    v-model="searchInp"
                  />
                </div>
                <div class="store-content flex flex-col gap-5">
                  <CheckboxInput
                    @update:model-value="checkedStocks($event, stock.id)"
                    :model-value="selectedStockIds.includes(stock.id)"
                    v-for="stock in compStocks"
                    >{{ stock.name }}
                  </CheckboxInput>
                </div>
              </template>
              <template v-if="tabFilter === 'date'">
                <div class="reset-content flex flex-col gap-5">
                  <button @click="resetFilter">
                    {{ $t('Reset_Filters') }}
                  </button>
                  <div class="date-tab flex flex-col">
                    <UIInputDate
                      :inline="true"
                      mode="range"
                      @update:model-value="updateFilterDate"
                      :model-value="date"
                      :clear="clear"
                    />
                  </div>
                </div>
              </template>
              <div class="footer flex justify-end">
                <UIButton @click="apply">{{ $t('Apply') }}</UIButton>
              </div>
            </div>
          </div>
          <div class="flex gap-4">
            <PaymentDialog
              :is-button-disabled="!selectedProvider.id"
              :is-pay-off="true"
              :payment-item="{
                provider: selectedProvider.company,
                balance:
                  parseNumber(selectedProvider.balance) > 0
                    ? 0
                    : parseNumber(selectedProvider.balance),
              }"
            />
          </div>
        </div>
      </div>
      <ScrollContainer
        ref="scrollContainerRef"
        storage-key="batch-status-table"
        dynamicHeightOffset="320"
      >
        <UITable>
          <template v-slot:thead>
            <tr>
              <UITdSort
                :columnName="$t('Internal Code')"
                sortKey="internal_code"
                :query="query"
                @sort="handleSortTable"
              />
              <UITdSort
                :columnName="$t('Available Date')"
                sortKey="created_at"
                :query="query"
                @sort="handleSortTable"
              />
              <UITdSort
                :columnName="$t('Stock')"
                sortKey="stock_id"
                :query="query"
                @sort="handleSortTable"
              />
              <UITdSort
                :columnName="$t('Provider')"
                sortKey="provider_id"
                :query="query"
                @sort="handleSortTable"
              />
              <UITdSort
                :columnName="$t('Total_Price')"
                sortKey="total_cost"
                :query="query"
                @sort="handleSortTable"
              />
              <UITdSort
                :columnName="$t('Balance')"
                sortKey="balance"
                :query="query"
                @sort="handleSortTable"
              />
              <td class="text-center">{{ $t('Delivered') }}</td>
              <td class="text-center">{{ $t('Approved') }}</td>
              <td class="text-center">{{ $t('Paid') }}</td>
              <td>{{ $t('Actions') }}</td>
            </tr>
          </template>
          <template v-slot:t-row>
            <tr v-if="batches?.data?.length" v-for="batch in batches.data">
              <td>{{ batch?.internal_code }}</td>
              <td>
                {{ batch?.available_date }}
              </td>
              <td>{{ batch?.stock?.data?.name }}</td>
              <td>{{ batch?.provider?.data?.company }}</td>
              <td>{{ formatCurrency(batch?.total_cost) }}</td>
              <td>
                <div
                  :class="
                    cn(
                      parseNumber(batch?.balance) < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    )
                  "
                >
                  {{ formatCurrency(batch?.balance) }}
                </div>
              </td>
              <td class="!pl-0">
                <div class="flex justify-center">
                  <Checkbox
                    :id="`delivered-${batch.id}`"
                    :checked="
                      batch.status_delivered || batch.status_approved
                        ? true
                        : false
                    "
                    :disabled="
                      batch.status_delivered || batch.status_approved
                        ? true
                        : false
                    "
                    @update:checked="
                      selectedBatchStatus = {
                        id: +batch.id,
                        status: 'status_delivered',
                      }
                    "
                  />
                </div>
              </td>
              <td class="!pl-0">
                <div class="flex justify-center">
                  <Checkbox
                    :id="`approved-${batch.id}`"
                    :checked="batch.status_approved ? true : false"
                    :disabled="batch.status_approved ? true : false"
                    @update:checked="
                      selectedBatchStatus = {
                        id: +batch.id,
                        status: 'status_approved',
                      }
                    "
                  />
                </div>
              </td>
              <td class="!pl-0">
                <div class="flex justify-center">
                  <Checkbox
                    :id="`paid-${batch.id}`"
                    :checked="batch.status_paid ? true : false"
                    :disabled="batch.status_paid ? true : false"
                    @update:checked="
                      selectedBatchStatus = {
                        id: +batch.id,
                        status: 'status_paid',
                      }
                    "
                  />
                </div>
              </td>
              <td class="!py-0">
                <div class="flex justify-center">
                  <RouterLink
                    :to="`/admin/buy/view-batch/${batch.id}`"
                    :class="
                      buttonVariants({
                        variant: 'ghost',
                        size: 'iconMd',
                        class: 'text-[var(--neutral-400)]',
                      })
                    "
                  >
                    <Eye />
                  </RouterLink>
                  <RouterLink
                    :to="`/admin/buy/edit-batch/${batch.id}`"
                    :class="
                      buttonVariants({
                        variant: 'ghost',
                        size: 'iconMd',
                        class: `text-[var(--neutral-400)] ${
                          batch.status_approved
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }`,
                      })
                    "
                    :disabled="batch.status_approved ? true : true"
                  >
                    <Pencil />
                  </RouterLink>
                  <PaymentDialog
                    icon="wallet"
                    :payment-item="{
                      batch_id: Number(batch.id),
                      provider: batch.provider?.data?.company,
                      balance: parseNumber(batch.balance),
                    }"
                  />
                </div>
              </td>
            </tr>
            <NoData v-else />
          </template>
        </UITable>
      </ScrollContainer>
    </div>
    <Pagination
      :currentPage="batches?.meta?.pagination?.current_page"
      :totalPages="batches?.meta?.pagination?.total_pages"
      v-if="batches?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
</template>

<style scoped>
.stock {
  padding: 32px;

  .provider-select {
    width: 240px;
  }

  .tab-header {
    padding-bottom: 9px;
    border-bottom: 1px solid var(--neutral-300);

    h2 {
      color: var(--neutral-300);
      cursor: pointer;

      &.active {
        color: var(--neutral-400);
        position: relative;

        &:before {
          content: '';
          position: absolute;
          bottom: -11px;
          left: 0;
          width: 100%;
          height: 3px;
          border-radius: 3px;
          background: var(--neutral-400);
        }
      }
    }
  }

  .transfer {
    .header {
      .duration {
        width: 277px;
      }
    }
  }

  .icon-buttons {
    padding: 7px 9px;
    border: 1px solid var(--neutral-200);
    background: var(--white);
    border-radius: 4px;
  }

  .filter-block {
    position: relative;

    .filter-block-content {
      position: absolute;
      width: 370px;
      border-radius: 10px;
      right: 0;
      background: var(--white);
      z-index: 1;
      box-shadow: 2px 2px 20px 0 #99a4a94d;

      .header {
        padding: 14px 21px;
      }

      .tabs {
        padding: 0 21px 8px;
        border-bottom: 1px solid var(--gray-100);

        .tab-item.active {
          font-family: Roboto, serif;
          font-size: 16px;
          font-weight: 600;
          line-height: 22px;
          text-align: left;
          color: var(--neutral-400);
        }
      }

      .reset-content {
        button {
          background: none;
          padding: 0;
          width: min-content;
          border: none;
          white-space: nowrap;
          margin-left: auto;
          cursor: pointer;
        }

        label {
          width: 100%;
        }

        padding: 8px 21px;
      }

      .date-tab {
        padding: 0 0 25px;
      }

      .store-content {
        padding: 16px 21px;
      }

      .footer {
        border-top: 1px solid var(--gray-100);
        padding: 8px 21px 16px;
      }
    }
  }
}
</style>
<style lang="scss">
.stock {
  .filter-block {
    .filter-block-content {
      .date-tab {
        .flatpickr-calendar.inline {
          top: -4px !important;
          left: 10px;
        }
      }
    }
  }
}
</style>
