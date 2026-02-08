<script setup lang="ts">
import IconDot from '@/components/icons/IconDot.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import { formatCurrency } from '@/lib/utils'
import { useOrdersStore } from '@/modules/sell/orders/store/orders.ts'
import { useStockStore } from '@/modules/stocks/store/stock'
import { useDebounceFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { buttonVariants } from '@/components/ui/button'
import { Eye } from 'lucide-vue-next'

const orderStore = useOrdersStore()
const { orders, filters } = storeToRefs(orderStore)
const chooseDuration = ref('')
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)
const stockStore = useStockStore()
const { stocks } = storeToRefs(stockStore)
const tabFilter = ref('store')
const open = ref(false)
const clear = ref(false)
const date = ref('')
const searchInp = ref('')
const selectedStockIds = ref([])
const searchValue = ref('')

const compStocks = computed(() => {
  return stocks.value.filter((item) => {
    return item.name.toLowerCase().includes(searchInp.value.toLowerCase())
  })
})

const checkedStocks = (e, id: string | number) => {
  if (e && !selectedStockIds.value.includes(id)) {
    selectedStockIds.value.push(id)
  } else {
    const index = selectedStockIds.value.indexOf(id)
    selectedStockIds.value.splice(index, 1)
  }
}

const resetFilter = async () => {
  selectedStockIds.value = []
  date.value = ''
  clear.value = true
  setTimeout(() => {
    clear.value = false
  })
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

const apply = async () => {
  // if (selectedStockIds.value.length) {
  //   query.value.stock_id = '[in]' + selectedStockIds.value.join(',')
  // } else if (!selectedStockIds.value.length) {
  //   delete query.value.stock_id
  // }
  // if (date.value.length) {
  //   query.value.created_at = '[between]' + date.value
  // } else if (!date.value.length) {
  //   delete query.value.created_at
  // }
  // await batchStore.actionGetBatchList()
}

// const { data, isPending } = useOrders('delivered')

const search = () => {
  if (searchValue.value) {
    filters.value.delivered.all = searchValue.value
  } else {
    delete filters.value.delivered.all
  }
  debouncedSearch()
}

const handleSortTable = async (sortType: string) => {
  if (filters.value.delivered['sort[]'] === `+${sortType}`) {
    filters.value.delivered = {
      ...filters.value.delivered,
      page: 1,
      'sort[]': `-${sortType}`,
    }
  } else if (filters.value.delivered['sort[]'] === `-${sortType}`) {
    filters.value.delivered = {
      ...filters.value.delivered,
      page: 1,
    }
    delete filters.value.delivered['sort[]']
  } else {
    filters.value.delivered = {
      ...filters.value.delivered,
      page: 1,
      'sort[]': `+${sortType}`,
    }
  }
  orderStore.actionGetOrders('delivered')
}

const debouncedSearch = useDebounceFn(() => {
  orderStore.actionGetOrders('delivered')
}, 300)

const updateDate = async (event: any) => {
  chooseDuration.value = event.split(',').join(' to ')
  if (event) {
    const dates = event.split(',')
    filters.value.delivered.start_date = dates
  } else {
    delete filters.value.delivered.start_date
  }
  orderStore.actionGetOrders('delivered')
}

const pageChange = async (page: number) => {
  filters.value.delivered.page = page
  await orderStore.actionGetOrders('delivered')
  scrollContainerRef.value?.scrollToTop()
}

onMounted(async () => {
  orderStore.$reset()
  await orderStore.actionGetOrders('delivered', 50)
})

watch(orders, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div class="flex h-full flex-col gap-[26px] p-8">
    <div class="header flex justify-between">
      <UIInputDate
        mode="range"
        :placeholder="$t('Choose_duration')"
        @update:model-value="updateDate"
        :model-value="chooseDuration"
      />

      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
      </div>
    </div>
    <ScrollContainer
      ref="scrollContainerRef"
      storage-key="history-order-table"
      dynamicHeightOffset="320"
    >
      <UITable>
        <template v-slot:thead>
          <tr>
            <UITdSort
              :columnName="$t('ID')"
              sortKey="id"
              :query="filters.delivered"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Date')"
              sortKey="order_date"
              :query="filters.delivered"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Customer')"
              sortKey="user_company"
              :query="filters.delivered"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Total_Price')"
              sortKey="order_total_price"
              :query="filters.delivered"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Status')"
              sortKey="order_date"
              :query="filters.delivered"
              @sort="handleSortTable"
            />
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr
            v-if="orders?.delivered?.data?.length"
            v-for="order in orders?.delivered?.data"
          >
            <td>{{ order?.id }}</td>
            <td>{{ order?.order_date?.split('T')[0] }}</td>
            <td>{{ order?.user?.company }}</td>
            <td>{{ formatCurrency(order?.order_total_price) }}</td>
            <td>
              <div class="flex items-center gap-1.5">
                <IconDot
                  :type="
                    order?.status === 5
                      ? 'Delivered'
                      : order?.status === 4
                        ? 'Declined'
                        : 'Refund'
                  "
                />
                {{ order.status == 5 ? $t('Delivered') : '' }}
                {{ order.status == 4 ? $t('Declined') : '' }}
                {{ order.status == 6 ? $t('Refund') : '' }}
              </div>
            </td>
            <td class="!py-0">
              <RouterLink
                :to="`/admin/sell/history/${order.id}`"
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
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </ScrollContainer>
    <Pagination
      :currentPage="orders?.delivered?.meta?.pagination?.current_page"
      :totalPages="orders?.delivered?.meta?.pagination?.total_pages"
      v-if="orders?.delivered?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
</template>

<style scoped>
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
</style>
