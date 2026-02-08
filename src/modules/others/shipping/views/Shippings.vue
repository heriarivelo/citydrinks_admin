<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Empty from '@/components/Empty.vue'
import UITable from '@/components/table/UITable.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { useShippingStore } from '@/modules/others/shipping/store/shipping.ts'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { SHIPPING_TYPES_BY_ID } from '../constants.ts'
import { useModalStore } from '@/store/modal.ts'
import { formatCurrency, sortTable } from '@/lib/utils.ts'
import { Button, buttonVariants } from '@/components/ui/button/index.ts'
import { Pencil, Trash2 } from 'lucide-vue-next'
import UITdSort from '@/components/table/UITdSort.vue'
import { RouterLink } from 'vue-router'
import NoData from '@/components/table/NoData.vue'

const shippingStore = useShippingStore()
const modalStore = useModalStore()
const { shippings, query } = storeToRefs(shippingStore)
const loaded = ref(false)
const searchValue = ref('')

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
  await shippingStore.actionGetShippings()
  loaded.value = true
}

const pageChange = (page: number) => {
  query.value.page = page
  shippingStore.actionGetShippings()
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => {
    loaded.value = false
    shippingStore.actionGetShippings()
    loaded.value = true
  })
}

onMounted(async () => {
  await shippingStore.actionGetShippings()
  loaded.value = true
})

onUnmounted(() => {
  delete query.value['all']
})
</script>

<template>
  <div
    v-if="shippings?.data?.length || !loaded || query?.['all']"
    class="shipping flex h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-end">
      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/others/shipping/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="shippingStore.exportCSV"
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
            :columnName="$t('Name')"
            sortKey="name"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Type')"
            sortKey="type"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Cost')"
            sortKey="cost"
            :query="query"
            @sort="handleSortTable"
          />
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr v-if="shippings.data?.length" v-for="ship in shippings.data">
          <td>{{ ship?.id }}</td>
          <td>{{ ship?.name }}</td>
          <td>{{ SHIPPING_TYPES_BY_ID[ship.type] }}</td>
          <td>{{ formatCurrency(ship?.cost) }}</td>
          <td class="!py-0">
            <div class="flex justify-center">
              <RouterLink
                :to="`/admin/others/shipping/edit/${ship.id}`"
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
                      header: $t('Delete_shipping'),
                      message: $t('Delete_shipping_text'),
                      type: 'shipping',
                      id: ship?.id,
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
      :currentPage="shippings?.meta?.pagination?.current_page"
      :totalPages="shippings?.meta?.pagination?.total_pages"
      v-if="shippings?.meta?.pagination?.total_pages > 1"
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
.shipping {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
