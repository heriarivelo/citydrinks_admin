<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { formatCurrency, sortTable } from '@/lib/utils'
import { PACK_USAGE_BY_VALUE } from '@/modules/stocks/products/constants.ts'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { useModalStore } from '@/store/modal.ts'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const modalStore = useModalStore()
const loaded = ref(false)
const { products, query } = storeToRefs(productStore)
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)

const handleSearch = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  debouncedSearch(value)
}

const debouncedSearch = useDebounceFn((value: string) => {
  if (value) {
    query.value = {
      ...query.value,
      page: 1,
      all: value,
    }
  } else {
    delete query.value['all']
  }

  router.push({
    query: { ...route.query, search: value || undefined, page: 1 },
  })

  loaded.value = false
  productStore.actionGetProducts()
  loaded.value = true
}, 300)

const pageChange = async (page: number) => {
  query.value.page = page
  await productStore.actionGetProducts()

  router.push({
    path: `/admin/stocks/products/${page}`,
    query: { ...route.query },
  })

  scrollContainerRef.value?.scrollToTop()
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => {
    loaded.value = false
    productStore.actionGetProducts()
    loaded.value = true
  })
}

onMounted(async () => {
  // Check if there's a search query in the URL
  const searchParam = route.query.search as string
  if (searchParam) {
    query.value.all = searchParam
  }

  if (route.params.page) {
    await productStore.actionGetProducts({
      page: Number(route.params.page),
    })
  } else {
    await productStore.actionGetProducts()
  }
  loaded.value = true
})

onUnmounted(() => {
  delete query.value['all']
})

watch(loaded, () => {
  if (loaded) {
    scrollContainerRef.value?.restoreScrollPosition()
  }
})
</script>

<template>
  <div
    v-if="products.data?.length || !loaded || query?.['all']"
    class="products flex h-fit min-h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-end">
      <div class="flex gap-2">
        <UIInput
          icon="search"
          :model-value="route.query.search as string"
          :placeholder="$t('Search')"
          @input="handleSearch"
        />
        <UIButton @click="$router.push('/admin/stocks/products/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="productStore.exportCSV"
          class="text-[var(--neutral-400)]"
        >
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
    <ScrollContainer
      ref="scrollContainerRef"
      storage-key="products-table"
      dynamicHeightOffset="320"
    >
      <UITable>
        <template v-slot:thead>
          <tr>
            <UITdSort
              :columnName="$t('ID')"
              sortKey="id"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Product_name')"
              sortKey="name"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Category')"
              sortKey="category"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Packs__Pallet')"
              sortKey="packs_quantity_per_pallet"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Cost')"
              sortKey="product_cost"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Price')"
              sortKey="price_per_pack"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Pack_Usage')"
              sortKey="pack_usage"
              :query="query"
              @sort="handleSortTable"
            />
            <td>{{ $t('Pack_Limits') }}</td>

            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr v-if="products?.data?.length" v-for="product in products.data">
            <td>{{ product?.id }}</td>
            <td>{{ product?.name }}</td>
            <td>{{ product?.category?.data?.name }}</td>
            <td>{{ product?.packs_quantity_per_pallet }}</td>
            <td>{{ formatCurrency(product?.product_cost) }}</td>
            <td>{{ formatCurrency(product?.price_per_pack) }}</td>
            <td>{{ PACK_USAGE_BY_VALUE[product?.pack_usage] }}</td>
            <td>
              {{
                product?.productLimitsPerPack?.data
                  ?.map((item) => item.limit)
                  .join(',')
              }}
            </td>
            <td class="!py-0">
              <div class="flex justify-center">
                <RouterLink
                  :to="`/admin/stocks/products/product/${product.id}`"
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
                  :to="`/admin/stocks/products/edit/${product.id}`"
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

                <Button
                  variant="ghost"
                  size="iconMd"
                  class="text-[var(--neutral-400)]"
                  @click="
                    modalStore.setModal({
                      target: 'deleteModal',
                      open: true,
                      data: {
                        header: $t('Delete_product'),
                        message: $t('Delete_product_text'),
                        type: 'product',
                        id: product?.id,
                      },
                    })
                  "
                >
                  <Trash2 />
                </Button>
              </div>
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </ScrollContainer>
    <Pagination
      :currentPage="products?.meta?.pagination?.current_page"
      :totalPages="products?.meta?.pagination?.total_pages"
      v-if="products?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
  <Empty
    v-else
    :text1="$t('Empty_Product1')"
    :text2="$t('Empty_Product2')"
    link="/admin/stocks/products/create"
  />
</template>

<style scoped>
.products {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
