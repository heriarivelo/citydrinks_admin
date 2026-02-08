<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import NoData from '@/components/table/NoData.vue'
import UITable from '@/components/table/UITable.vue'
import UITdSort from '@/components/table/UITdSort.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { cn, formatCurrency, parseNumber, sortTable } from '@/lib/utils'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { useModalStore } from '@/store/modal.ts'
import { Eye, Pencil, Trash2, Wallet } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const providersStore = useProvidersStore()
const loaded = ref(false)
const { providers, query } = storeToRefs(providersStore)
const modalStore = useModalStore()
const searchValue = ref('')

onMounted(async () => {
  await providersStore.actionGetProviders()
  loaded.value = true
})

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
  await providersStore.actionGetProviders()
  loaded.value = true
}

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => providersStore.actionGetProviders())
}

const pageChange = (page: number) => {
  query.value.page = page
  providersStore.actionGetProviders()
}

onUnmounted(() => {
  delete query.value['all']
})
</script>

<template>
  <div
    v-if="providers?.data?.length || query?.['all'] || !loaded"
    class="providers flex h-fit min-h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-end">
      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/buy/providers/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="providersStore.exportCSV"
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
            :columnName="$t('Company')"
            sortKey="company"
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
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr v-if="providers?.data?.length" v-for="provider in providers.data">
          <td>{{ provider?.id }}</td>
          <td>{{ provider?.company }}</td>
          <td>{{ provider?.user_name }}</td>
          <td>{{ provider?.vat }}</td>
          <td>
            <div
              :class="
                cn(
                  parseNumber(provider?.balance) < 0 && 'text-red-600',
                  parseNumber(provider?.balance) > 0 && 'text-green-600'
                )
              "
            >
              {{ formatCurrency(provider?.balance) }}
            </div>
          </td>
          <td class="!py-0">
            <div class="flex justify-center">
              <RouterLink
                :to="`/admin/buy/providers/${provider.id}`"
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
              <PaymentDialog
                icon="wallet"
                :payment-item="{
                  balance:
                    parseNumber(provider.balance) > 0
                      ? 0
                      : parseNumber(provider.balance),
                  provider: provider.company,
                }"
              />
              <RouterLink
                :to="`/admin/buy/providers/edit/${provider.id}`"
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
                      type: 'provider',
                      id: provider?.id,
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
      :currentPage="providers?.meta?.pagination?.current_page"
      :totalPages="providers?.meta?.pagination?.total_pages"
      v-if="providers?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
  <Empty
    v-else
    :text1="$t('Empty_Providers1')"
    :text2="$t('Empty_Providers2')"
    link="/admin/buy/providers/create"
  />
</template>

<style scoped>
.providers {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
