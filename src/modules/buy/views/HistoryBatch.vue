<script setup lang="ts">
import { useGetBatchHistory } from '@/api/batch'
import Empty from '@/components/Empty.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSortUrl from '@/components/table/UITdSortUrl.vue'
import { buttonVariants } from '@/components/ui/button/index.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { formatCurrency } from '@/lib/utils'
import { useDebounceFn } from '@vueuse/core'
import { Eye } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useProvidersStore } from '../providers/store/provider'

const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)
const route = useRoute()
const router = useRouter()
const exportImportOpen = ref(false)
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)

const params = computed(() => ({
  page: route.query.page || 1,
  provider: route.query.provider,
  all: route.query.all,
  ['sort[]']: route.query['sort[]'],
}))

const { data: bathHistoryData, isFetching } = useGetBatchHistory(params)

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

const computedSelectedProvider = computed(() => {
  return providers.value.data?.find(
    (provider) => provider.id == route.query.provider
  )
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
    query: { ...route.query, all: value || undefined },
  })
}, 300)

onMounted(async () => {
  await providersStore.actionGetProviders()
})

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
          :model-value="route.query.all as string"
          @input="handleSearch"
        />
        <SingleSelect
          class="w-[240px]"
          :placeholder="$t('Provider')"
          :data="providers.data"
          show-key="company"
          :selected="computedSelectedProvider"
          @select="
            (selectedItem) => {
              $router.push({
                query: { ...route.query, provider: selectedItem.id },
              })
            }
          "
        />
      </div>
    </div>
    <ScrollContainer ref="scrollContainerRef" storage-key="batch-history-table">
      <UITable>
        <template v-slot:thead>
          <tr>
            <UITdSortUrl
              :columnName="$t('Internal_Code')"
              sortKey="internal_code"
            />
            <UITdSortUrl
              :columnName="$t('Waiting_Date')"
              sortKey="waiting_date"
            />
            <UITdSortUrl :columnName="$t('Stock')" sortKey="stock" />
            <UITdSortUrl :columnName="$t('Provider')" sortKey="provider_name" />
            <UITdSortUrl
              :columnName="$t('Total_Price')"
              sortKey="total_price"
            />
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr
            v-if="bathHistoryData?.data?.length"
            v-for="batchHistoryDataItem in bathHistoryData?.data"
          >
            <td>{{ batchHistoryDataItem.internal_code }}</td>
            <td>{{ batchHistoryDataItem.available_date }}</td>
            <td>
              {{ batchHistoryDataItem.stock }}
            </td>
            <td>
              {{ batchHistoryDataItem.provider }}
            </td>
            <td>
              {{ formatCurrency(batchHistoryDataItem.total_cost) }}
            </td>
            <td class="!py-0">
              <div class="flex justify-center">
                <RouterLink
                  :to="`/admin/buy/view-batch-history/${batchHistoryDataItem.id}`"
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
              </div>
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </ScrollContainer>
    <Pagination
      :currentPage="Number(route.query.page) || 1"
      :totalPages="bathHistoryData?.meta?.pagination?.total_pages"
      v-if="bathHistoryData?.meta?.pagination?.total_pages > 1"
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
