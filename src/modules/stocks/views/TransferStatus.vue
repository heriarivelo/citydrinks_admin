<script setup lang="ts">
import { useTransfers } from '@/api/transfer'
import UITable from '@/components/table/UITable.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { cn, formatCurrency } from '@/lib/utils'
import { useModalStore } from '@/store/modal.ts'
import axiosClient from '@/utils/axiosClient'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Eye, Pencil, TriangleAlert } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TransferStatus } from '../store/types/transferTypes'
import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITdSortUrl from '@/components/table/UITdSortUrl.vue'
import NoData from '@/components/table/NoData.vue'
dayjs.extend(customParseFormat)

const modalStore = useModalStore()
const router = useRouter()
const open = ref(false)
const selectedTransferStatus = ref<{ id: number; status: TransferStatus }>(null)
const route = useRoute()
const chooseDuration = ref('')
const params = computed(() => ({
  page: route.query.page || 1,
  from: route.query.from,
  to: route.query.to,
  ['sort[]']: route.query['sort[]'],
}))
const { data, isFetching } = useTransfers({
  params,
  transferType: computed(() => 'transfer-status'),
})
const queryClient = useQueryClient()
const scrollContainerRef = ref<InstanceType<typeof ScrollContainer> | null>(
  null
)

const updateDate = async (event: any) => {
  chooseDuration.value = event.split(',').join(' to ')
  const from = event.split(',')[0]
    ? dayjs(event.split(',')[0], 'MM-DD-YYYY').format('YYYY-MM-DD')
    : undefined
  const to = event.split(',')[1]
    ? dayjs(event.split(',')[1], 'MM-DD-YYYY').format('YYYY-MM-DD')
    : undefined
  router.push({
    query: { ...route.query, from: from || undefined, to: to || undefined },
  })
}

const pageChange = async (page: number) => {
  router.push({
    query: { ...route.query, page },
  })
  scrollContainerRef.value?.scrollToTop()
}

const closeSelect = (event: Event | null = null) => {
  let target
  if (event) target = event.target as HTMLInputElement
  if (
    !event ||
    !target?.closest('.filter-block-content') ||
    target?.closest('.cancel-button')
  ) {
    open.value = false
    window.removeEventListener('click', closeSelect)
  }
}

const transferStatusMutation = useMutation({
  mutationFn: ({ id, status }: { id: number; status: TransferStatus }) =>
    axiosClient.put(`/admin/transfers-status/${id}`, {
      status,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transfer-status'] })
    queryClient.invalidateQueries({
      queryKey: ['stocks'],
    })
    selectedTransferStatus.value = null
  },
})

const updateBatchTransferStatus = () => {
  transferStatusMutation.mutate({
    id: selectedTransferStatus.value.id,
    status: selectedTransferStatus.value.status,
  })
}

onMounted(async () => {
  if (params.value.from && params.value.to) {
    chooseDuration.value = `${dayjs(params.value.from as string).format('DD-MM-YYYY') || ''} to ${dayjs(params.value.to as string).format('DD-MM-YYYY') || ''}`
  }
})

watch(isFetching, () => {
  scrollContainerRef.value?.restoreScrollPosition()
})
</script>
<template>
  <AlertDialog :open="selectedTransferStatus ? true : false">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('Update_Transfer_Status') }}</AlertDialogTitle>
        <AlertDialogDescription
          class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
        >
          <TriangleAlert
            class="mt-1 shrink-0 text-secondary"
            stroke-width="2.5"
          />
          <span class="text-justify">
            Are you sure you want to update the status
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          class="w-[6.375rem]"
          @click="updateBatchTransferStatus"
          :disabled="transferStatusMutation.isPending.value"
          >Save</Button
        >
        <AlertDialogCancel
          class="w-[6.375rem]"
          @click="selectedTransferStatus = null"
          >Cancel</AlertDialogCancel
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <div class="transfer flex min-h-full flex-col gap-[26px] px-6 py-5">
    <div class="header flex justify-end">
      <div class="flex gap-4">
        <UIInputDate
          class="duration"
          mode="range"
          :placeholder="$t('Choose_duration')"
          :model-value="chooseDuration"
          @update:model-value="updateDate"
        />
      </div>
    </div>
    <ScrollContainer
      ref="scrollContainerRef"
      storage-key="transfer-status-table"
      dynamicHeightOffset="320"
    >
      <UITable>
        <template v-slot:thead>
          <tr>
            <UITdSortUrl :columnName="$t('ID')" sortKey="id" />
            <UITdSortUrl :columnName="$t('Date')" sortKey="date" />
            <UITdSortUrl :columnName="$t('Packs__Pallet')" sortKey="quantity" />
            <UITdSortUrl :columnName="$t('Sender')" sortKey="sender" />
            <UITdSortUrl :columnName="$t('Receiver')" sortKey="receiver" />
            <UITdSortUrl :columnName="$t('Total_Price')" sortKey="balance" />
            <td class="!px-2 text-center">{{ $t('Delivered') }}</td>
            <td class="!px-2 text-center">{{ $t('Approved') }}</td>
            <td class="!px-2 text-center">{{ $t('Ready_for_transfer') }}</td>
            <td>{{ $t('Actions') }}</td>
          </tr>
        </template>
        <template v-slot:t-row>
          <tr
            v-if="data?.data?.length"
            v-for="transfer in data?.data"
            :class="{ 'auto-transfer': transfer.is_auto_transfer }"
          >
            <td>{{ transfer.id }}</td>
            <td>
              {{ transfer.date }}
            </td>
            <td>
              {{ transfer.quantity }}
            </td>
            <td>{{ transfer.sender }}</td>
            <td>{{ transfer.receiver }}</td>
            <td>
              {{ formatCurrency(transfer.price) }}
            </td>
            <td class="!pl-0">
              <div class="flex justify-center">
                <Checkbox
                  :id="`delivered-${transfer.id}`"
                  :checked="
                    transfer.status === 'delivered' ||
                    transfer.status === 'approved'
                  "
                  :disabled="
                    transfer.status === 'delivered' ||
                    transfer.status === 'approved'
                  "
                  @update:checked="
                    selectedTransferStatus = {
                      id: transfer.id,
                      status: 'delivered',
                    }
                  "
                />
              </div>
            </td>
            <td class="!pl-0">
              <div class="flex justify-center">
                <Checkbox
                  :id="`approved-${transfer.id}`"
                  :checked="transfer.status === 'approved'"
                  :disabled="transfer.status === 'approved'"
                  @update:checked="
                    selectedTransferStatus = {
                      id: transfer.id,
                      status: 'approved',
                    }
                  "
                />
              </div>
            </td>
            <td class="!pl-0">
              <div class="flex justify-center">
                <Checkbox
                  :id="`ready-for-transfer-${transfer.id}`"
                  :checked="transfer.ready_for_transfer ? true : false"
                  :disabled="!!transfer.ready_for_transfer"
                  @update:checked="
                    selectedTransferStatus = {
                      id: transfer.id,
                      status: 'ready_for_transfer',
                    }
                  "
                />
              </div>
            </td>
            <td class="!py-0">
              <div class="flex justify-center">
                <Button
                  variant="ghost"
                  size="iconMd"
                  :class="
                    cn(
                      'text-[var(--neutral-400)]',
                      transfer.is_auto_transfer && 'hover:bg-orange-200'
                    )
                  "
                  @click="
                    modalStore.setModal({
                      open: true,
                      target: 'transferEdit',
                      data: {
                        ...transfer,
                        is_view: true,
                      },
                    })
                  "
                >
                  <Eye />
                </Button>
                <Button
                  variant="ghost"
                  size="iconMd"
                  :class="
                    cn(
                      'text-[var(--neutral-400)]',
                      transfer.is_auto_transfer && 'hover:bg-orange-200'
                    )
                  "
                  @click="
                    modalStore.setModal({
                      open: true,
                      target: 'transferEdit',
                      data: transfer,
                    })
                  "
                  :disabled="transfer.status === 'approved'"
                >
                  <Pencil />
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
      :totalPages="data?.meta.last_page"
      v-if="data?.meta.last_page > 1"
      @page-change="pageChange"
    />
  </div>
</template>
