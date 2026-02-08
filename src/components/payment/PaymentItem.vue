<script setup lang="ts">
import { Payment } from '@/api/types/payment'
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import { Button } from '@/components/ui/button/index.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn, formatCurrency, parseNumber } from '@/lib/utils'
import { PaymentType } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ChevronDown, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const isPaymentDeleteDialogOpen = ref(false)
const route = useRoute()
const queryClient = useQueryClient()
const paymentType = computed(
  () => route.path.split('/').slice(-2, -1)[0] as PaymentType
)
const isPaymentOpen = ref(false)
const { paymentItem } = defineProps<{
  paymentItem: Payment
}>()

const deleteMutation = useMutation({
  mutationFn: (id: number) =>
    axiosClient.delete(
      paymentType.value === 'sell'
        ? `/admin/payments/delete/${id}`
        : `/admin/payments/provider/delete/${id}`
    ),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: [`payments-${paymentType.value}`],
    })
    queryClient.invalidateQueries({ queryKey: ['debts'] })
    queryClient.invalidateQueries({ queryKey: ['batch-history'] })
    isPaymentDeleteDialogOpen.value = false
  },
})
</script>

<template>
  <td>
    <div>
      {{ paymentItem.id }}
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      {{ subItem.id }}
    </div>
  </td>
  <td>
    <div class="whitespace-nowrap">
      {{ paymentItem.input_date }}
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('h-[30px]', subItemIndex === 0 && 'h-[34px]')"
    ></div>
  </td>
  <td>
    <div>{{ paymentItem.name }}</div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('h-[30px]', subItemIndex === 0 && 'h-[34px]')"
    ></div>
  </td>

  <td class="max-w-[400px]">
    <div class="line-clamp-1">
      <span v-if="paymentItem.description">{{ paymentItem.description }}</span>
      <span v-else-if="paymentItem.items.length">
        {{ paymentItem.items[0].description?.split('#')[0] }}
      </span>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      <span class="line-clamp-1">
        {{ subItem.description?.split('#')[0] }}
      </span>
    </div>
  </td>
  <td v-if="paymentType === 'buy'">
    <div :class="cn(paymentItem.items.length > 1 && 'select-none opacity-0')">
      <span v-if="paymentItem.items.length">{{
        paymentItem.items[0].batch?.internal_code
      }}</span>
      <span v-else-if="paymentItem.batch?.internal_code">{{
        paymentItem.batch?.internal_code
      }}</span>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      <span v-if="subItem.batch?.internal_code">
        {{ subItem.batch?.internal_code }}
      </span>
      <span v-else class="select-none opacity-0">0</span>
    </div>
  </td>
  <td v-else>
    <div :class="cn(paymentItem.items.length > 1 && 'select-none opacity-0')">
      <span v-if="paymentItem.items.length">{{
        paymentItem.items[0].order?.id
      }}</span>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      <span v-if="subItem.order?.id">
        {{ subItem.order?.id }}
      </span>
      <span v-else class="select-none opacity-0">0</span>
    </div>
  </td>
  <!-- Total Sum -->
  <td>
    <div :class="cn(paymentItem.items.length > 1 && 'select-none opacity-0')">
      <span
        v-if="paymentItem.items.length"
        :class="cn(paymentItem.items[0].refill && 'select-none opacity-0')"
      >
        {{
          formatCurrency(
            paymentType === 'buy'
              ? paymentItem.items[0].batch?.total_cost
              : paymentItem.items[0].order?.order_total_price
          )
        }}
      </span>
      <span v-else>
        {{
          formatCurrency(
            paymentType === 'buy'
              ? paymentItem.batch?.total_cost
              : paymentItem.order?.order_total_price
          )
        }}
      </span>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="
        cn(
          'py-1 ps-0 opacity-80',
          subItemIndex === 0 && 'pt-2',
          subItem.refill && 'select-none opacity-0'
        )
      "
    >
      <span v-if="paymentType === 'buy'">
        {{ formatCurrency(subItem.batch?.total_cost) }}
      </span>
      <span v-else>
        {{ formatCurrency(subItem.order?.order_total_price) }}
      </span>
    </div>
  </td>
  <!-- Paid -->
  <td>
    <div>{{ formatCurrency(paymentItem.amount) }}</div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      {{
        formatCurrency(
          paymentType === 'buy'
            ? subItem.amount || subItem.amount
            : subItem.amount
        )
      }}
    </div>
  </td>
  <!-- Balance -->
  <td>
    <div
      v-if="paymentType === 'buy'"
      :class="
        cn(
          parseNumber(paymentItem.balance) < 0 && 'text-red-600',
          parseNumber(paymentItem.balance) > 0 && 'text-green-600',
          paymentItem.items.length === 1 &&
            parseNumber(paymentItem.items[0].balance) < 0 &&
            'text-red-600',
          paymentItem.items.length === 1 &&
            parseNumber(paymentItem.items[0].balance) > 0 &&
            'text-green-600'
        )
      "
    >
      <span
        v-if="paymentItem.items.length === 1"
        :class="cn(paymentItem.items[0].refill && 'select-none opacity-0')"
      >
        {{
          formatCurrency(paymentItem.balance || paymentItem.items[0].balance)
        }}
      </span>
      <span v-else-if="!paymentItem.items.length">
        {{ formatCurrency(paymentItem.balance) }}
      </span>
      <span class="select-none opacity-0">0</span>
    </div>

    <div
      v-else
      :class="
        cn(
          parseNumber(
            paymentItem.items.length && paymentItem.items[0].balance
          ) < 0 && 'text-red-600',
          parseNumber(
            paymentItem.items.length && paymentItem.items[0].balance
          ) > 0 && 'text-green-600'
        )
      "
    >
      <span
        v-if="paymentItem.items.length === 1"
        :class="cn(paymentItem.items[0].refill && 'select-none opacity-0')"
      >
        {{ formatCurrency(paymentItem.items[0].balance) }}
      </span>
      <span v-else-if="!paymentItem.items.length">
        {{ formatCurrency(paymentItem.amount) }}
      </span>
      <span class="select-none opacity-0">0</span>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('py-1 ps-0 opacity-80', subItemIndex === 0 && 'pt-2')"
    >
      <div
        :class="
          cn(
            parseNumber(subItem.balance) < 0 && 'text-red-600',
            parseNumber(subItem.balance) > 0 && 'text-green-600',
            subItem.refill && 'select-none opacity-0'
          )
        "
      >
        {{ formatCurrency(subItem.balance) }}
      </div>
    </div>
  </td>
  <!-- Actions -->
  <td class="!px-0 !py-0">
    <div class="flex !min-h-full items-start justify-center">
      <PaymentDialog
        :payment-item="{
          id: paymentItem.id,
          company: paymentItem.name,
          provider: paymentItem.name,
          balance: parseNumber(paymentItem.amount),
          document_purpose: paymentItem.description,
        }"
        icon="pencil"
        :is-button-disabled="paymentItem.disabled"
      />
      <Dialog
        :open="isPaymentDeleteDialogOpen"
        @update:open="isPaymentDeleteDialogOpen = $event"
      >
        <DialogTrigger as-child>
          <Button
            type="button"
            variant="ghost"
            size="iconMd"
            class="text-[var(--neutral-400)]"
            @click="isPaymentDeleteDialogOpen = true"
            :disabled="paymentItem.disabled"
          >
            <Trash2 />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ $t('Delete_Provider_Payment') }}</DialogTitle>
          </DialogHeader>
          <DialogDescription
            class="mb-6 mt-2 flex gap-2.5 rounded-md border border-border/30 py-2 pb-12 pe-4 ps-3"
          >
            Are you sure you want to delete this provider payment?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="destructive"
              class="w-[6.375rem]"
              @click="deleteMutation.mutate(paymentItem.id)"
              :disabled="deleteMutation.isPending.value"
            >
              {{ $t('Delete') }}
            </Button>
            <DialogTrigger as-child>
              <Button
                type="button"
                variant="outline"
                class="w-[6.375rem]"
                :disabled="deleteMutation.isPending.value"
                @click="isPaymentDeleteDialogOpen = false"
              >
                {{ $t('Cancel') }}
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('h-[30px]', subItemIndex === 0 && 'h-[34px]')"
    ></div>
  </td>
  <td class="!px-0">
    <Button
      type="button"
      variant="ghost"
      size="iconMd"
      class="text-[var(--neutral-400)]"
      @click="isPaymentOpen = !isPaymentOpen"
      v-if="paymentItem.items.length > 1"
    >
      <ChevronDown
        :class="
          cn('scale-125 transition-transform', isPaymentOpen && 'rotate-180')
        "
      />
    </Button>
    <div
      v-if="isPaymentOpen"
      v-for="(subItem, subItemIndex) in paymentItem.items"
      :class="cn('h-[30px]', subItemIndex === 0 && 'h-[34px]')"
    ></div>
  </td>
</template>
