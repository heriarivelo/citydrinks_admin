<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import IconFileExchange24 from '@/components/icons/IconFileExchange24.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import { Button, buttonVariants } from '@/components/ui/button/index.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover/index.ts'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import UIButton from '@/components/ui/UIButton.vue'
import { useColumns } from '@/composables/useColumns'
import { cn, sortTable } from '@/lib/utils.ts'
import { PACK_USAGE_BY_VALUE } from '@/modules/stocks/products/constants.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { useModalStore } from '@/store/modal.ts'
import {
  ArrowLeftRight,
  ArrowRightLeft,
  CircleAlert,
  Pencil,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ACTIVE_STATUS,
  BLOCKED_STATUS,
  RESERVED_STATUS,
  STOCK_STATUSES,
} from '../constants.ts'
import { TStockItem } from '../store/types/stockTypes.ts'

const stockStore = useStockStore()
const { stockItems, query } = storeToRefs(stockStore)
const route = useRoute()
const exportImportOpen = ref(false)
const modalStore = useModalStore()
const searchValue = ref('')
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)
const defaultColumns = [
  {
    key: 'id',
    label: 'NN',
    visible: true,
  },
  {
    key: 'product',
    label: 'Product',
    visible: true,
  },
  {
    key: 'total',
    label: 'Total',
    visible: true,
  },
  {
    key: 'blocked',
    label: 'Blocked',
    visible: false,
  },
  {
    key: 'available',
    label: 'Available',
    visible: false,
  },
  {
    key: 'provider',
    label: 'Provider',
    visible: true,
  },
  {
    key: 'pack_usage',
    label: 'PK Usage',
    visible: true,
  },
  {
    key: 'statuses',
    label: 'Status',
    visible: true,
  },
]

const { columns, toggleColumnVisibility, isColumnVisible } = useColumns(
  defaultColumns,
  'stocksColumns'
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
  await stockStore.actionGetStockItems(String(route.params.stock))
}

const pageChange = async (page: number) => {
  query.value.page = page
  await stockStore.actionGetStockItems(String(route.params.stock))
  scrollContainerRef.value?.scrollToTop()
}

const openExportImport = () => {
  exportImportOpen.value = !exportImportOpen.value
  if (exportImportOpen.value) {
    setTimeout(() => {
      window.addEventListener('click', closeSelect)
    })
  } else {
    closeSelect()
  }
}

const closeSelect = () => {
  exportImportOpen.value = false
  window.removeEventListener('click', closeSelect)
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () =>
    stockStore.actionGetStockItems(String(route.params.stock))
  )
}

const getStatus = (stockItem: TStockItem) => {
  if (
    Number(stockItem.available_pack_quantity) > 0 ||
    Number(stockItem.available_pallet_quantity) > 0
  ) {
    return ACTIVE_STATUS
  }
  if (
    Number(stockItem.available_pack_quantity) <= 0 &&
    Number(stockItem.available_pallet_quantity) <= 0 &&
    (Number(stockItem.blocked_pack_quantity) >= 1 ||
      Number(stockItem.blocked_pallet_quantity) >= 1)
  ) {
    return BLOCKED_STATUS
  }
  return RESERVED_STATUS
}

onMounted(async () => {
  await stockStore.actionGetStockItems(String(route.params.stock))
})

onUnmounted(() => {
  delete query.value['all']
})

watch(
  route,
  async (newStock) => {
    if (newStock.params?.stock) {
      delete query.value['all']
      searchValue.value = ''
      await stockStore.actionGetStockItems(String(route.params.stock))
    }
  },
  { deep: true }
)

watch(query, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div v-if="true" class="stock flex h-fit min-h-full flex-col gap-[26px]">
    <div class="header flex justify-between gap-4">
      <UIInput
        icon="search"
        v-model="searchValue"
        :placeholder="$t('Search')"
        @input="search"
        input-class="!w-[230px]"
      />
      <div class="flex gap-4">
        <UIButton
          @click="
            $router.push(`/admin/buy/${$route.params.stock}/add-new-batch`)
          "
          >{{ $t('Add_new_batch') }}</UIButton
        >
        <UIButton
          types="cancel"
          @click="
            modalStore.setModal({
              open: true,
              target: 'createStock',
            })
          "
          >{{ $t('Create_Stock') }}
        </UIButton>
        <Button
          variant="outline"
          size="iconLg"
          class="size-[42px] border-indigo-100 text-[var(--neutral-400)] shadow-[0px_0px_10px_0px_#d5d8e6] transition-shadow hover:bg-transparent hover:shadow-sm"
          @click="
            modalStore.setModal({
              open: true,
              target: 'editStock',
              data: { id: $route.params.stock },
            })
          "
        >
          <Pencil />
        </Button>
        <RouterLink
          :to="`/admin/stocks/${$route.params.stock}/transfer-products`"
          :class="
            buttonVariants({
              variant: 'outline',
              size: 'iconLg',
              class:
                'size-[42px] !border-indigo-100 text-[var(--neutral-400)] !shadow-[0px_0px_10px_0px_#d5d8e6] !transition-shadow hover:!bg-transparent hover:!shadow-sm',
            })
          "
        >
          <ArrowLeftRight />
        </RouterLink>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="iconLg"
              class="size-[42px] border-indigo-100 text-[var(--neutral-400)] shadow-[0px_0px_10px_0px_#d5d8e6] transition-shadow hover:bg-transparent hover:shadow-sm [&_svg]:size-6"
            >
              <IconFileExchange24 />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-40 p-2">
            <Button
              variant="ghost"
              @click="stockStore.exportCSV(Number($route.params.stock))"
              class="body-text h-8 w-full justify-start px-2 font-normal"
            >
              {{ $t('Export_as_xls') }}
            </Button>
            <Button
              variant="ghost"
              class="body-text h-8 w-full justify-start px-2 font-normal"
            >
              {{ $t('Import') }}
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <ScrollContainer
      ref="scrollContainerRef"
      :storage-key="`stocks-table-${$route.params.stock}`"
      dynamicHeightOffset="320"
    >
      <UITable
        :columns="columns"
        :toggle-column-visibility="toggleColumnVisibility"
      >
        <template v-slot:thead>
          <tr>
            <UITdSort
              :columnName="$t('NN')"
              sortKey="id"
              :query="query"
              @sort="handleSortTable"
              v-if="isColumnVisible('id')"
            />
            <UITdSort
              :columnName="$t('Product')"
              sortKey="name"
              :query="query"
              @sort="handleSortTable"
              v-if="isColumnVisible('product')"
            />
            <UITdSort
              :columnName="$t('Provider')"
              sortKey="provider_name"
              :query="query"
              @sort="handleSortTable"
              v-if="isColumnVisible('provider')"
            />
            <td
              v-if="isColumnVisible('total')"
              class="w-28 !px-2 !py-1"
              :class="{
                asc: query['sort[]'] === '-' + 'quantity',
                desc: query['sort[]'] === '+' + 'quantity',
              }"
            >
              <div class="flex flex-col items-center">
                <div class="pe-7">{{ $t('Total') }}</div>
                <div class="flex">
                  <div class="w-12 text-sm">PL</div>
                  <div class="w-12 text-sm">PK</div>
                </div>
              </div>
            </td>
            <td
              v-if="isColumnVisible('blocked')"
              class="w-28 !px-2 !py-1"
              :class="{
                asc: query['sort[]'] === '-' + 'blocked',
                desc: query['sort[]'] === '+' + 'blocked',
              }"
            >
              <div class="flex flex-col items-center">
                <div class="pe-7">{{ $t('Blocked') }}</div>
                <div class="flex">
                  <div class="w-12 text-sm">PL</div>
                  <div class="w-12 text-sm">PK</div>
                </div>
              </div>
            </td>
            <td
              v-if="isColumnVisible('available')"
              class="w-28 !px-2 !py-1"
              :class="{
                asc: query['sort[]'] === '-' + 'available',
                desc: query['sort[]'] === '+' + 'available',
              }"
            >
              <div class="flex flex-col items-center">
                <div class="pe-7">{{ $t('Available') }}</div>
                <div class="flex">
                  <div class="w-12 text-sm">PL</div>
                  <div class="w-12 text-sm">PK</div>
                </div>
              </div>
            </td>
            <UITdSort
              :columnName="$t('PK_Usage')"
              sortKey="pack_usage"
              :query="query"
              @sort="handleSortTable"
              v-if="isColumnVisible('pack_usage')"
            />
            <UITdSort
              :columnName="$t('Status')"
              sortKey="statuses"
              :query="query"
              @sort="handleSortTable"
              v-if="isColumnVisible('statuses')"
            />
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr
            v-if="stockItems.data?.length"
            v-for="stockItem in stockItems.data"
          >
            <td v-if="isColumnVisible('id')">
              <div class="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <div>
                        <CircleAlert
                          v-if="stockItem.reserved_quantity"
                          :size="18"
                          class="text-[var(--status)]"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {{ stockItem.reserved_quantity }}
                        {{ $t('pack') }}
                        {{ $t('reserved') }}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div
                  v-if="
                    !stockItem.reserved_quantity &&
                    stockItems.data.filter((item) => item.reserved_quantity)
                      .length
                  "
                  class="w-4"
                ></div>
                {{ stockItem.id }}
              </div>
            </td>
            <td v-if="isColumnVisible('product')">{{ stockItem.name }}</td>
            <td v-if="isColumnVisible('provider')">
              {{
                Array.from(new Set(stockItem.provider_name?.split(','))).join(
                  ','
                )
              }}
            </td>
            <td v-if="isColumnVisible('total')" class="!ps-2">
              <div class="flex">
                <div class="w-12">{{ stockItem.total_pallet_quantity }}</div>
                <div class="w-12">{{ stockItem.total_pack_quantity }}</div>
              </div>
            </td>
            <td v-if="isColumnVisible('blocked')" class="!ps-2">
              <div class="flex">
                <div class="w-12">{{ stockItem.blocked_pallet_quantity }}</div>
                <div class="w-12">{{ stockItem.blocked_pack_quantity }}</div>
              </div>
            </td>
            <td v-if="isColumnVisible('available')" class="!ps-2">
              <div class="flex">
                <div class="w-12">
                  {{ stockItem.available_pallet_quantity }}
                </div>
                <div class="w-12">{{ stockItem.available_pack_quantity }}</div>
              </div>
            </td>
            <td v-if="isColumnVisible('pack_usage')">
              {{ PACK_USAGE_BY_VALUE[stockItem.pack_usage] }}
            </td>
            <td v-if="isColumnVisible('statuses')">
              <span
                v-if="getStatus(stockItem) === ACTIVE_STATUS"
                :class="cn('status', 'before:!bg-[var(--success-500)]')"
              >
                {{ $t(STOCK_STATUSES[ACTIVE_STATUS]) }}
              </span>
              <span
                v-else-if="getStatus(stockItem) === BLOCKED_STATUS"
                :class="cn('status', 'before:!bg-[var(--warning-500)]')"
              >
                {{ $t(STOCK_STATUSES[BLOCKED_STATUS]) }}
              </span>
              <span
                v-else-if="getStatus(stockItem) === RESERVED_STATUS"
                :class="cn('status', 'before:!bg-[var(--status)]')"
              >
                {{ $t(STOCK_STATUSES[RESERVED_STATUS]) }}
              </span>
            </td>
            <td class="!py-0">
              <div class="flex justify-center">
                <RouterLink
                  :to="`/admin/stocks/${$route.params.stock}/transfer-products/${stockItem.id}`"
                  :class="
                    buttonVariants({
                      variant: 'ghost',
                      size: 'iconMd',
                      class: 'text-[var(--neutral-400)]',
                    })
                  "
                >
                  <ArrowRightLeft />
                </RouterLink>
                <RouterLink
                  :to="`/admin/stocks/${$route.params.stock}/edit-product/${stockItem.id}`"
                  :class="
                    buttonVariants({
                      variant: 'ghost',
                      size: 'iconMd',
                      class: 'text-[var(--neutral-400)]',
                    })
                  "
                >
                  <Pencil />
                </RouterLink>
              </div>
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </ScrollContainer>
    <Pagination
      :currentPage="stockItems?.meta?.pagination?.current_page"
      :totalPages="stockItems?.meta?.pagination?.total_pages"
      v-if="stockItems?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
  <Empty
    v-else
    :text1="$t('Empty_Shipping1')"
    :text2="$t('Empty_Shipping2')"
    link="/admin/others/shipping/create"
  />
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
