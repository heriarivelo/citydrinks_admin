<script setup lang="ts">
import UITable from '@/components/table/UITable.vue'
import { useOrdersStore } from '@/modules/sell/orders/store/orders.ts'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import UIButton from '@/components/ui/UIButton.vue'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useRoute, useRouter } from 'vue-router'
import Pagination from '@/components/ui/Pagination.vue'

const ordersStore = useOrdersStore()
const { approvedData } = storeToRefs(ordersStore)
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  ordersStore.$reset()
  await ordersStore.actionGetSeeAll()
})

const pageChange = async (page: string) => {
  router.push({
    query: { ...route.query, page },
  })
  await ordersStore.actionGetSeeAll(page)
}
</script>

<template>
  <div class="see-all flex min-h-full flex-col gap-4 p-8">
    <div class="flex justify-between">
      <UIButton type="button" types="cancel" @click="$router.go(-1)">
        {{ $t('Go_Back') }}
      </UIButton>
      <Button variant="ghost" class="text-[var(--neutral-400)]">
        {{ $t('Export_csv') }}
      </Button>
    </div>
    <div class="custom-scrollbar max-h-[calc(100dvh-300px)] overflow-y-auto">
      <UITable>
        <template v-slot:thead>
          <tr>
            <td>{{ $t('Product_Name') }}</td>
            <td>{{ $t('Packs__Pallet') }}</td>
            <td class="!text-start">{{ $t('Total_Price') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr v-for="order in approvedData?.data">
            <td>{{ order?.product_name }}</td>
            <td>
              <span
                v-if="order?.pallet_quantity && order?.pallet_quantity != '0'"
              >
                {{ order.pallet_quantity }} PL
              </span>
              <span v-else class="">0 PL </span>
              <span>{{ order.pack_quantity }} PK</span>
            </td>
            <td class="!text-start">{{ formatCurrency(order.total_price) }}</td>
          </tr>
        </template>
      </UITable>
    </div>
    <Pagination
      :currentPage="Number(route.query.page) || 1"
      :totalPages="approvedData?.last_page"
      v-if="approvedData?.last_page > 1"
      @page-change="pageChange"
    />
  </div>
</template>
