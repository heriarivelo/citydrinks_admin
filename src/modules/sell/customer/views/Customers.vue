<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UITable from '@/components/table/UITable.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { useCustomerStore } from '@/modules/sell/customer/store/customer.ts'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import StatusSelect from '@/components/ui/selects/StatusSelect.vue'
import { useModalStore } from '@/store/modal.ts'
import { CUSTOMER_STATUSES } from '@/modules/others/employee/constants.ts'
import { cn, formatCurrency, parseNumber, sortTable } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import UITdSort from '@/components/table/UITdSort.vue'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import { RouterLink } from 'vue-router'
import NoData from '@/components/table/NoData.vue'

const customerStore = useCustomerStore()
const loaded = ref(false)
const { customers, query } = storeToRefs(customerStore)
const modalStore = useModalStore()
const selectedStatus = ref([])
const searchValue = ref('')
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
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
  await customerStore.actionGetCustomers()
  loaded.value = true
}

const filter = async (e) => {
  let index = selectedStatus.value.findIndex((obj) => obj.id === e.id)
  if (index !== -1) {
    selectedStatus.value.splice(index, 1)
  } else {
    selectedStatus.value.push(e)
  }
  if (selectedStatus.value.length) {
    query.value = {
      ...query.value,
      page: 1,
      status: '[in]' + selectedStatus.value.map((item) => item.id).join(),
    }
  } else {
    delete query.value.status
  }
  loaded.value = false
  await customerStore.actionGetCustomers()
  loaded.value = true
}

const pageChange = async (page: number) => {
  query.value.page = page
  await customerStore.actionGetCustomers()
  scrollContainerRef.value?.scrollToTop()
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => {
    loaded.value = false
    customerStore.actionGetCustomers()
    loaded.value = true
  })
}

onMounted(async () => {
  await customerStore.actionGetCustomers()
  loaded.value = true
})

onUnmounted(() => {
  delete query.value['all']
})

watch(query, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>

<template>
  <div
    v-if="customers?.data?.length || !loaded || query?.status || query?.['all']"
    class="customers flex h-fit min-h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-between">
      <div class="flex gap-4">
        <StatusSelect
          :placeholder="$t('Choose_Status')"
          :data="CUSTOMER_STATUSES"
          :selected="selectedStatus"
          @select="filter"
        />
      </div>
      <div class="flex gap-2">
        <UIInput
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/sell/customer/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="customerStore.exportCSV"
          class="text-[var(--neutral-400)]"
        >
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
    <ScrollContainer
      ref="scrollContainerRef"
      storage-key="customers-table"
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
              :columnName="$t('Company')"
              sortKey="company"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Email')"
              sortKey="email"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Username')"
              sortKey="user_name"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('VAT')"
              sortKey="vat"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Balance')"
              sortKey="balance"
              :query="query"
              @sort="handleSortTable"
            />
            <UITdSort
              :columnName="$t('Status')"
              sortKey="status"
              :query="query"
              @sort="handleSortTable"
            />
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr v-if="customers?.data?.length" v-for="customer in customers.data">
            <td>{{ customer?.id }}</td>
            <td>{{ customer?.company }}</td>
            <td>{{ customer?.email }}</td>
            <td>{{ customer?.user_name }}</td>
            <td>{{ customer?.vat }}</td>
            <td>
              <div
                :class="
                  cn(
                    parseNumber(customer?.balance) < 0 && 'text-red-600',
                    parseNumber(customer?.balance) > 0 && 'text-green-600'
                  )
                "
              >
                {{ formatCurrency(customer?.balance) }}
              </div>
            </td>
            <td>
              <span class="status" :class="{ active: customer.status == 1 }">
                {{ customer.status == 1 ? 'Active' : 'Deactivated' }}
              </span>
            </td>
            <td class="!py-0">
              <div class="flex justify-center">
                <RouterLink
                  :to="`/admin/sell/customer/${customer.id}`"
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
                  :to="`/admin/sell/customer/edit/${customer.id}`"
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
                        header: $t('Delete_user'),
                        message: $t('Delete_user_text'),
                        type: 'customer',
                        id: customer?.id,
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
      :currentPage="customers?.meta?.pagination?.current_page"
      :totalPages="customers?.meta?.pagination?.total_pages"
      v-if="customers?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>

  <Empty
    v-else
    :text1="$t('Empty_Customer1')"
    :text2="$t('Empty_Customer2')"
    link="/admin/sell/customer/create"
  />
</template>

<style scoped>
.customers {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
