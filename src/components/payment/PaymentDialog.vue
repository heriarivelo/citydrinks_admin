<script setup lang="ts">
import { fetchCustomers } from '@/api/customer'
import { fetchProviders } from '@/api/provider'
import { PaymentDialog } from '@/api/types/payment'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button/index.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import { cn, formatCurrency, parseEuroCurrency, parseNumber } from '@/lib/utils'
import { useOrdersStore } from '@/modules/sell/orders/store/orders'
import { PaymentType } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Eye, EyeOff, Pencil, Wallet } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchSelect from '../ui/selects/SearchSelect.vue'
import { Customer } from '@/api/types/customer'
import { Provider } from '@/api/types/provider'
import { useBatchStore } from '@/modules/stocks/store/batch'
import { useProvidersStore } from '@/modules/buy/providers/store/provider'
dayjs.extend(customParseFormat)

const ordersStore = useOrdersStore()
const queryClient = useQueryClient()
const batchStore = useBatchStore()
const route = useRoute()
const paymentType = computed(
  () => route.path.split('/').slice(-2, -1)[0] as PaymentType
)
const providersStore = useProvidersStore()
const isPaymentDialogOpen = ref(false)
const selectedProvider = ref({} as Provider)
const selectedCustomer = ref({} as Customer)
const date = ref('')
const amount = ref('')
const note = ref('')
const errors = ref({} as Record<string, string>)
const showWithNegativeBalance = ref(true)
const { data: customers } = useQuery({
  queryKey: ['customers'],
  queryFn: () => fetchCustomers({}),
})
const customersFiltered = computed(() => {
  return customers.value.data?.filter((customer) => {
    return (
      (showWithNegativeBalance.value
        ? parseNumber(customer.balance) < 0
        : true) || customer.id === selectedCustomer.value?.id
    )
  })
})
const { data: providers } = useQuery({
  queryKey: ['providers'],
  queryFn: () => fetchProviders({}),
})
const providersFiltered = computed(() => {
  return providers.value.data?.filter((provider) => {
    return (
      (showWithNegativeBalance.value
        ? parseNumber(provider.balance) < 0
        : true) || provider.id === selectedProvider.value?.id
    )
  })
})

const { paymentItem, icon, isPayOff, isButtonDisabled } = defineProps<{
  paymentItem?: PaymentDialog
  icon?: 'pencil' | 'wallet'
  isPayOff?: boolean
  isButtonDisabled?: boolean
}>()

watch(isPaymentDialogOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handlePaymentDialogOpen = (paymentItem: PaymentDialog) => {
  isPaymentDialogOpen.value = true
  selectedProvider.value = providers.value.data?.find((provider) => {
    return (
      provider.company?.trim().toLowerCase() ===
      paymentItem?.provider?.trim().toLowerCase()
    )
  })
  selectedCustomer.value = customers.value.data?.find(
    (customer) => customer.company === paymentItem?.company
  )
  date.value = paymentItem?.date || dayjs().format('DD-MM-YYYY')
  amount.value = paymentItem?.balance
    ? formatCurrency(Math.abs(parseNumber(paymentItem.balance)), true, true)
    : ''
  note.value = paymentItem?.document_purpose
}

const handlePaymentDialogClose = () => {
  isPaymentDialogOpen.value = false
  showWithNegativeBalance.value = true
  selectedProvider.value = {} as Provider
  selectedCustomer.value = {} as Customer
  date.value = dayjs().format('DD-MM-YYYY')
  amount.value = ''
  note.value = ''
  errors.value = {}
}

const validateFields = () => {
  errors.value = {}
  if (!selectedProvider.value?.id && paymentType.value === 'buy') {
    errors.value.provider = 'Provider is required'
  }
  if (!selectedCustomer.value?.id && paymentType.value === 'sell') {
    errors.value.customer = 'Customer is required'
  }
  if (!date.value) {
    errors.value.date = 'Date is required'
  }
  if (!amount.value) {
    errors.value.amount = 'Amount is required'
  }

  return Object.keys(errors.value).length === 0
}

const saveMutation = useMutation({
  mutationFn: async () => {
    if (!validateFields()) {
      return Promise.reject()
    }

    const submitValues = {
      id: paymentItem?.id,
      order_id: paymentItem?.order_id,
      batch_id: paymentItem?.batch_id,
      date: dayjs(date.value, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      amount: parseEuroCurrency(amount.value),
      provider_id: selectedProvider.value?.id,
      customer_id: selectedCustomer.value?.id,
      description: note.value,
    }

    if (paymentItem?.id) {
      return axiosClient.put(
        paymentType.value === 'sell'
          ? `/admin/payments/edit/${paymentItem.id}`
          : `/admin/payments/provider/edit/${paymentItem.id}`,
        submitValues
      )
    }

    return axiosClient.post(
      paymentType.value === 'sell'
        ? '/admin/payments/add'
        : '/admin/payments/provider/add',
      submitValues
    )
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: [`payments-${paymentType.value}`],
    })
    queryClient.invalidateQueries({ queryKey: ['debts'] })
    handlePaymentDialogClose()
    if (paymentType.value === 'sell') {
      ordersStore.actionInitOrders()
      queryClient.invalidateQueries({
        queryKey: ['customers'],
      })
    } else {
      providersStore.actionGetProviders()
      queryClient.invalidateQueries({
        queryKey: ['providers'],
      })
      queryClient.invalidateQueries({
        queryKey: ['batch-history'],
      })
      batchStore.actionGetBatchList()
    }
  },
  onError: (error) => {
    console.log(error)
  },
})
</script>

<template>
  <AlertDialog :modal="false" :open="isPaymentDialogOpen === true">
    <AlertDialogTrigger as-child>
      <Button
        v-if="icon"
        type="button"
        variant="ghost"
        size="iconMd"
        class="text-[var(--neutral-400)]"
        @click="handlePaymentDialogOpen(paymentItem)"
        :disabled="isButtonDisabled"
      >
        <Pencil v-if="icon === 'pencil'" />
        <Wallet v-else />
      </Button>
      <Button
        v-else-if="isPayOff"
        @click="handlePaymentDialogOpen(paymentItem)"
        class="w-[6.375rem]"
        :disabled="isButtonDisabled"
      >
        {{ $t('Pay_Off') }}
      </Button>
      <Button
        v-else
        @click="handlePaymentDialogOpen(paymentItem)"
        :disabled="isButtonDisabled"
        >{{ $t('New_Payment') }}
      </Button>
    </AlertDialogTrigger>
    <div
      v-if="isPaymentDialogOpen === true"
      className="fixed inset-0 z-30 bg-black/50"
    ></div>
    <AlertDialogContent @open-auto-focus="$event.preventDefault()">
      <AlertDialogHeader>
        <AlertDialogTitle
          class="flex items-center justify-between gap-2 text-[var(--neutral-400)]"
        >
          {{ paymentItem?.id ? $t('Edit_Payment') : $t('New_Payment') }}
        </AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription as-child class="mb-8 mt-4 flex flex-col gap-6">
        <div class="flex flex-col gap-6">
          <div class="relative">
            <SearchSelect
              v-if="paymentType === 'buy'"
              :error="errors.provider"
              @click="errors.provider = ''"
              :placeholder="`${$t('Provider')} *`"
              :data="providersFiltered"
              show-key="company"
              :selected="selectedProvider"
              @select="selectedProvider = $event"
              :disabled="paymentItem?.provider ? true : false"
              :class="cn(paymentItem?.provider && 'opacity-80')"
            />
            <SearchSelect
              v-else-if="paymentType === 'sell'"
              :error="errors.customer"
              @click="errors.customer = ''"
              :placeholder="`${$t('Customer')} *`"
              :data="customersFiltered"
              show-key="company"
              :selected="selectedCustomer"
              @select="selectedCustomer = $event"
              :disabled="paymentItem?.company ? true : false"
              :class="cn(paymentItem?.company && 'opacity-80')"
            />
            <Button
              v-if="!paymentItem?.provider && !paymentItem?.company"
              type="button"
              variant="ghost"
              size="iconSm"
              class="absolute end-14 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]"
              @click="showWithNegativeBalance = !showWithNegativeBalance"
            >
              <EyeOff v-if="showWithNegativeBalance" />
              <Eye v-else />
            </Button>
          </div>

          <UIInputDate
            :error="errors.date"
            @click="errors.date = ''"
            :placeholder="`${$t('Choose_date')} *`"
            @update:model-value="date = $event"
            :model-value="date"
            :disable-future="true"
          />
          <UIInput
            :error="errors.amount"
            @click="errors.amount = ''"
            symbol="€"
            :placeholder="`${$t('Amount')} *`"
            v-model="amount"
          />
          <UIInput
            :error="errors.note"
            @click="errors.note = ''"
            :placeholder="`${$t('Note')} ${
              paymentItem?.order_id || paymentItem?.batch_id ? '' : ''
            }`"
            v-model="note"
          />
        </div>
      </AlertDialogDescription>
      <AlertDialogFooter>
        <Button type="button" class="w-[6.375rem]" @click="saveMutation.mutate">
          {{ $t('Save') }}
        </Button>
        <AlertDialogTrigger as-child>
          <Button
            type="button"
            variant="outline"
            class="w-[6.375rem]"
            @click="handlePaymentDialogClose"
          >
            {{ $t('Cancel') }}
          </Button>
        </AlertDialogTrigger>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
