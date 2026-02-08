<script setup lang="ts">
import { fetchCustomers } from '@/api/customer'
import { fetchDebts } from '@/api/debt'
import { Customer } from '@/api/types/customer'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import NoData from '@/components/table/NoData.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import { formatCurrency, parseNumber } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { Eye, EyeOff } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
const showWithNegativeBalance = ref(true)
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)
const route = useRoute()
const router = useRouter()
const selectedCustomer = ref({} as Customer)
const { data: customers } = useQuery({
  queryKey: ['customers'],
  queryFn: () => fetchCustomers({}),
})
const customersFiltered = computed(() => {
  return customers.value?.data?.filter((customer) => {
    return (
      (showWithNegativeBalance.value
        ? parseNumber(customer.balance) < 0
        : true) || customer.id === selectedCustomer.value?.id
    )
  })
})

const params = computed(() => ({
  page: route.query.page || 1,
  customer_id: route.query.customer_id,
}))

const pageChange = async (page: number) => {
  router.push({
    query: { ...route.query, page },
  })
  scrollContainerRef.value?.scrollToTop()
}

const handleCustomerSelect = (customer: Customer) => {
  selectedCustomer.value = customer
  router.push({
    query: { ...route.query, customer_id: customer.id },
  })
}

const { data: debts } = useQuery({
  queryKey: ['debts', params],
  queryFn: () => fetchDebts(params.value),
  placeholderData: keepPreviousData,
})
</script>

<template>
  <div class="flex h-full flex-col gap-6 p-8">
    <RouterLink
      to="/admin/sell/orders"
      :class="
        buttonVariants({
          variant: 'outline',
          class: 'self-start',
        })
      "
    >
      {{ $t('Go_Back') }}
    </RouterLink>
    <div class="flex justify-between">
      <div class="relative">
        <SearchSelect
          :placeholder="$t('Choose_customer')"
          :data="customersFiltered"
          show-key="company"
          :selected="selectedCustomer"
          @select="handleCustomerSelect"
          container-class="w-[320px]"
          :is-clearable="true"
        />
        <Button
          type="button"
          variant="ghost"
          size="iconMd"
          class="absolute -end-8 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]"
          @click="showWithNegativeBalance = !showWithNegativeBalance"
        >
          <EyeOff v-if="showWithNegativeBalance" />
          <Eye v-else />
        </Button>
      </div>
      <div class="flex gap-4">
        <PaymentDialog
          :is-button-disabled="!selectedCustomer.id"
          :is-pay-off="true"
          :payment-item="{
            company: selectedCustomer.company,
            balance: selectedCustomer.balance,
          }"
        />
      </div>
    </div>
    <ScrollContainer ref="scrollContainerRef" storage-key="debts">
      <UITable>
        <template v-slot:thead>
          <tr>
            <td>{{ $t('ID') }}</td>
            <td>{{ $t('Customer') }}</td>
            <td>{{ $t('Pallet') }}</td>
            <td>{{ $t('Pack') }}</td>
            <td>{{ $t('Total_Price') }}</td>
            <td>{{ $t('Paid') }}</td>
            <td>{{ $t('Balance') }}</td>
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr v-if="debts?.data?.length" v-for="order in debts?.data">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>{{ order.pallet }}</td>
            <td>{{ order.pack }}</td>
            <td>{{ formatCurrency(order.total_price) }}</td>
            <td>{{ formatCurrency(order.paid_amount) }}</td>
            <td class="!text-red-600">
              {{ formatCurrency(order.sold) }}
            </td>
            <td class="!py-0">
              <div class="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="iconMd"
                  class="text-[var(--neutral-400)]"
                >
                  <PaymentDialog
                    :id="order.id"
                    icon="wallet"
                    :payment-item="{
                      order_id: order.id,
                      balance: parseNumber(order.sold),
                      company: order.customer,
                    }"
                  />
                </Button>
              </div>
            </td>
          </tr>
          <NoData v-else />
        </template>
      </UITable>
    </ScrollContainer>
    <Pagination
      :currentPage="Number(route.query.page) || 1"
      :totalPages="debts?.meta?.last_page"
      v-if="debts?.meta?.last_page > 1"
      @page-change="pageChange"
    />
  </div>
</template>
