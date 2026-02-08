<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import NoData from '@/components/table/NoData.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import { Button } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { formatCurrency, sortTable } from '@/lib/utils'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { useModalStore } from '@/store/modal.ts'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'

const relatedStore = useRelatedStore()
const modalStore = useModalStore()
const loaded = ref(false)
const { relatedProducts, query } = storeToRefs(relatedStore)
const searchValue = ref('')

const search = (event: Event) => {
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
  relatedStore.actionGetRelatedProducts()
  loaded.value = true
}

const pageChange = (page: number) => {
  query.value.page = page
  relatedStore.actionGetRelatedProducts()
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => {
    loaded.value = false
    relatedStore.actionGetRelatedProducts()
    loaded.value = true
  })
}

onMounted(async () => {
  await relatedStore.actionGetRelatedProducts()
  loaded.value = true
})

onUnmounted(() => {
  delete query.value['all']
})
</script>

<template>
  <div
    v-if="relatedProducts?.data?.length || !loaded || query?.['all']"
    class="related-products flex h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-end">
      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/others/related/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="relatedStore.exportCSV"
          class="text-[var(--neutral-400)]"
        >
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
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
            :columnName="$t('Related_product')"
            sortKey="name"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Cost')"
            sortKey="cost_price"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Price')"
            sortKey="price"
            :query="query"
            @sort="handleSortTable"
          />
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr
          v-if="relatedProducts.data?.length"
          v-for="relatedProduct in relatedProducts.data"
        >
          <td>{{ relatedProduct?.id }}</td>
          <td>{{ relatedProduct?.name }}</td>
          <td>{{ formatCurrency(relatedProduct?.cost_price) }}</td>
          <td>{{ formatCurrency(relatedProduct?.price) }}</td>
          <td class="!py-0">
            <div class="flex justify-center">
              <Button
                variant="ghost"
                size="iconMd"
                class="text-[var(--neutral-400)]"
                @click="
                  modalStore.setModal({
                    target: 'editRelatedProductModal',
                    open: true,
                    data: {
                      related_product: relatedProduct,
                    },
                  })
                "
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="iconMd"
                class="text-[var(--neutral-400)]"
                @click="
                  modalStore.setModal({
                    target: 'deleteModal',
                    open: true,
                    data: {
                      header: $t('Delete_related_product'),
                      message: $t('Delete_related_product_text'),
                      type: 'related_product',
                      id: relatedProduct?.id,
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
    <Pagination
      :currentPage="relatedProducts?.meta?.pagination?.current_page"
      :totalPages="relatedProducts?.meta?.pagination?.total_pages"
      v-if="relatedProducts?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
  <Empty
    v-else
    :text1="$t('Empty_Related_Product1')"
    :text2="$t('Empty_Related_Product2')"
    link="/admin/others/related/create"
  />
</template>

<style scoped>
.related-products {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
