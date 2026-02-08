<script setup lang="ts">
import { useStocks } from '@/api/stock.ts'
import Empty from '@/components/Empty.vue'
import IconFileExchange24 from '@/components/icons/IconFileExchange24.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSortUrl from '@/components/table/UITdSortUrl.vue'
import { Button, buttonVariants } from '@/components/ui/button/index.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover/index.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { useColumns } from '@/composables/useColumns'
import { cn } from '@/lib/utils.ts'
import { PACK_USAGE_BY_VALUE } from '@/modules/stocks/products/constants.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { useModalStore } from '@/store/modal.ts'
import { useDebounceFn } from '@vueuse/core'
import { ArrowRightLeft, CircleAlert, Pencil } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ACTIVE_STATUS,
  BLOCKED_STATUS,
  RESERVED_STATUS,
  STOCK_STATUSES,
} from '../constants.ts'
import { TStockItem } from '../store/types/stockTypes.ts'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const stockStore = useStockStore()
const { stocks } = storeToRefs(stockStore)
const route = useRoute()
const router = useRouter()
const exportImportOpen = ref(false)
const modalStore = useModalStore()
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
  'allStocksColumns'
)

const params = computed(() => ({
  page: route.query.page || 1,
  stock: route.query.stock,
  search: route.query.search,
  ['sort[]']: route.query['sort[]'],
}))

const { data: stocksData, isFetching } = useStocks(params)

const pageChange = async (page: number) => {
  router.push({
    query: { ...route.query, page },
  })
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

const computedSelectedStock = computed(() => {
  return stocks.value.find((stock) => stock.id == route.query.stock)
})

const closeSelect = () => {
  exportImportOpen.value = false
  window.removeEventListener('click', closeSelect)
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
  await stockStore.actionGetStocks()
})

watch(
  route,
  async (newStock) => {
    if (newStock.params?.stock) {
      await stockStore.actionGetStockItems(String(route.params.stock))
    }
  },
  { deep: true }
)

watch(isFetching, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div v-if="true" class="stock flex h-fit min-h-full flex-col gap-[26px]">
    <div class="header flex justify-between">
      <div class="flex gap-4">
        <UIInput
          icon="search"
          :placeholder="$t('Search')"
          :model-value="route.query.search as string"
          @input="handleSearch"
          input-class="!w-[230px]"
        />
        <SingleSelect
          class="w-[200px]"
          :placeholder="$t('Select_Stock')"
          :data="stocks"
          show-key="name"
          :selected="computedSelectedStock"
          @select="
            (selectedStock) => {
              $router.push({
                query: { ...route.query, stock: selectedStock.id },
              })
            }
          "
        />
      </div>

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
      storage-key="all-stocks-table"
      dynamicHeightOffset="320"
    >
      <UITable
        :columns="columns"
        :toggle-column-visibility="toggleColumnVisibility"
      >
        <template v-slot:thead>
          <tr>
            <UITdSortUrl
              :columnName="$t('NN')"
              sortKey="id"
              v-if="isColumnVisible('id')"
            />
            <UITdSortUrl
              v-if="isColumnVisible('product')"
              :columnName="$t('Product')"
              sortKey="name"
            />
            <UITdSortUrl
              v-if="isColumnVisible('provider')"
              :columnName="$t('Provider')"
              sortKey="provider_name"
            />
            <td
              v-if="isColumnVisible('total')"
              class="w-28 !px-2 !py-1"
              :class="{
                asc: route.query['sort[]'] === '-' + 'quantity',
                desc: route.query['sort[]'] === '+' + 'quantity',
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
                asc: route.query['sort[]'] === '-' + 'quantity',
                desc: route.query['sort[]'] === '+' + 'quantity',
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
                asc: route.query['sort[]'] === '-' + 'quantity',
                desc: route.query['sort[]'] === '+' + 'quantity',
              }"
            >
              <div class="flex flex-col items-center">
                <div class="pe-8">{{ $t('Available') }}</div>
                <div class="flex">
                  <div class="w-12 text-sm">PL</div>
                  <div class="w-12 text-sm">PK</div>
                </div>
              </div>
            </td>
            <UITdSortUrl
              v-if="isColumnVisible('pack_usage')"
              :columnName="$t('PK_Usage')"
              sortKey="pack_usage"
            />
            <UITdSortUrl
              v-if="isColumnVisible('statuses')"
              :columnName="$t('Status')"
              sortKey="statuses"
            />
            <td class="w-36">{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr
            v-if="stocksData?.data?.length"
            v-for="stockItem in stocksData?.data"
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
                    stocksData.data.filter((item) => item.reserved_quantity)
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
                  :to="`/admin/stocks/${stockItem.stock_id}/transfer-products/${stockItem.id}`"
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
                  :to="`/admin/stocks/all/edit-product/${stockItem.id}`"
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
      :currentPage="Number(route.query.page) || 1"
      :totalPages="stocksData?.meta?.last_page"
      v-if="stocksData?.meta?.last_page > 1"
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
