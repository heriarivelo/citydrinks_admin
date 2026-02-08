<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/lib/utils'
import { TriangleAlert } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    showKey?: string
    selectedKey?: string
    selected?: number
    containerClass?: string
    disabledStatus?: string
  }>(),
  {
    placeholder: '',
    showKey: 'name',
    selectedKey: 'id',
    disabledStatus: '',
  }
)

const STATUSES = [
  {
    name: 'Waiting',
    class: 'neutral',
    id: 1,
  },
  {
    name: 'Approved',
    class: 'success',
    id: 2,
  },
  {
    name: 'On_the_way',
    class: 'status-class',
    id: 3,
  },
  {
    name: 'Delivered',
    class: 'delivered',
    id: 5,
  },
  {
    name: 'Declined',
    class: 'warning',
    id: 4,
  },
]

const STATUS_TRANSITIONS = {
  Waiting: ['Approved', 'Declined'],
  Approved: ['Waiting', 'On_the_way', 'Declined'],
  On_the_way: ['Approved', 'Delivered'],
  Delivered: [], 
  Declined: ['Waiting'],
}

const emit = defineEmits(['select'])
const isOrderStatusSelectDialogOpen = ref(false)
const pendingStatus = ref<any>(null)

const compSelected = computed(() =>
  STATUSES.find((item) => item.id == props?.selected)
)

const handleSelect = (value: string) => {
  const selectedStatus = STATUSES.find(
    (status) => status.id.toString() === value
  )
  if (selectedStatus?.name === 'Declined') {
    pendingStatus.value = selectedStatus
    isOrderStatusSelectDialogOpen.value = true
  } else if (selectedStatus) {
    emit('select', selectedStatus)
  }
}

const confirmStatusChange = () => {
  if (pendingStatus.value) {
    emit('select', pendingStatus.value)
    isOrderStatusSelectDialogOpen.value = false
    pendingStatus.value = null
  }
}

const cancelStatusChange = () => {
  isOrderStatusSelectDialogOpen.value = false
  pendingStatus.value = null
}

const filteredStatuses = computed(() => {
  const currentStatus = compSelected.value?.name
  if (!currentStatus) return []

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || []

  return STATUSES.filter(
    (status) =>
      allowedTransitions.includes(status.name) &&
      status.name !== props.disabledStatus
  )
})

const isSelectable = computed(() => {
  return (
    compSelected.value?.name !== 'Delivered' &&
    filteredStatuses.value.length > 0
  )
})
</script>

<template>
  <AlertDialog :open="isOrderStatusSelectDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('Update_Order_Status') }}</AlertDialogTitle>
        <AlertDialogDescription
          class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
        >
          <TriangleAlert
            class="mt-1 shrink-0 text-secondary"
            stroke-width="2.5"
          />
          <span class="text-start">
            Are you sure you want to update the order status to
            <span class="text-destructive">Declined</span> ?
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button class="w-[6.375rem]" @click="confirmStatusChange">Save</Button>
        <AlertDialogCancel class="w-[6.375rem]" @click="cancelStatusChange"
          >Cancel</AlertDialogCancel
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <Select
    :model-value="props.selected?.toString()"
    @update:model-value="handleSelect"
    :disabled="!isSelectable"
  >
    <SelectTrigger
      :class="
        cn('mx-auto h-8 w-[134px] border-none text-base', compSelected?.class)
      "
    >
      <SelectValue>
        {{ compSelected ? $t(compSelected[showKey]) : placeholder }}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-if="!isSelectable"
          disabled
          value="na"
          class="py-1 text-base"
        >
          N/A
        </SelectItem>
        <SelectItem
          v-else
          v-for="status in filteredStatuses"
          :key="status.id"
          :value="status.id.toString()"
          :class="
            cn(
              'py-1 text-base',
              status.name === 'Declined'
                ? 'text-destructive'
                : 'text-[var(--neutral-400)]'
            )
          "
        >
          {{ $t(status[showKey]) }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped lang="scss">
.neutral {
  background: var(--neutral-100);
}
.success {
  background: var(--success-100);
}
.warning {
  background: var(--warning-200);
}
.status-class {
  background: var(--status);
}
.delivered {
  background: var(--success-300);
}

:deep(.select-trigger) {
  &[data-placeholder] {
    color: var(--gray-200);
  }
}
</style>
