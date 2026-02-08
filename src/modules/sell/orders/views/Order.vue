<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import { cn, formatCurrency } from '@/lib/utils'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useOrdersStore } from '@/modules/sell/orders/store/orders'
import { TOrder } from '@/modules/sell/orders/store/types/ordersTypes'

type Props = {
  isHistory?: boolean
}

const { isHistory } = withDefaults(defineProps<Props>(), {
  isHistory: false,
})

const route = useRoute()
const ordersStore = useOrdersStore()
const { order } = storeToRefs(ordersStore)

import { Button, buttonVariants } from '@/components/ui/button'
import OrdersStatusSelect from '@/components/ui/selects/OrdersStatusSelect.vue'
import { CircleAlert } from 'lucide-vue-next'
import {
  TooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import axiosClient from '@/utils/axiosClient'

onMounted(() => {
  ordersStore.actionGetOrderCustom(Number(route.params.id))
})

onUnmounted(() => {
  order.value = {} as TOrder
})

const calculateRelatedProductQuantity = (
  relatedProduct: any,
  orderItem: any
) => {
  return relatedProduct.related_product.related_with == 2
    ? Number(
        orderItem.batchItem?.data?.product?.data?.packs_quantity_per_pallet
      ) *
        Number(orderItem.pallet_quantity) +
        Number(orderItem.pack_quantity)
    : Number(orderItem.pallet_quantity || 0) + (orderItem.pack_quantity ? 1 : 0)
}

const calculateRelatedProductPrice = (relatedProduct: any, orderItem: any) => {
  return (
    Number(relatedProduct.related_product.price) *
    (relatedProduct.related_product.related_with == 2
      ? Number(
          orderItem.batchItem?.data?.product?.data?.packs_quantity_per_pallet
        ) *
          Number(orderItem.pallet_quantity) +
        Number(orderItem.pack_quantity)
      : Number(orderItem.pallet_quantity || 0) +
        (orderItem.pack_quantity ? 1 : 0))
  )
}

const isGeneratingPDF = ref(false)
const downloadPDF = async () => {
  try {
    isGeneratingPDF.value = true
    const orderId = order.value.id
    const response = await axiosClient(`/admin/orders/${orderId}/print`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `order_${orderId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
  } finally {
    isGeneratingPDF.value = false
  }
}
</script>

<template>
  <div class="order flex flex-col">
    <div class="head-part flex flex-col gap-[1.125rem]">
      <div>
        <UIButton type="button" types="cancel" @click="$router.go(-1)">
          {{ $t('Go_Back') }}
        </UIButton>
      </div>
      <div class="header-content flex justify-between">
        <div class="left flex flex-col gap-4">
          <h2 class="text-gray-500">
            {{ $t('Providing_to') }}
          </h2>
          <div class="flex flex-col gap-2">
            <div class="flex gap-4">
              <h3>{{ $t('Company_Name') }}:</h3>
              <p class="body-text text-gray-500">
                {{ order.user?.data.company }}
              </p>
            </div>
            <div class="flex gap-4">
              <h3>{{ $t('Address') }}:</h3>
              <p class="body-text text-gray-500">
                {{ order.user?.data.address }}
              </p>
            </div>
            <div class="flex gap-4">
              <h3>{{ $t('Phone_Number') }}:</h3>
              <p class="body-text text-gray-500">
                {{ order.user?.data.phone }}
              </p>
            </div>
            <div class="flex gap-4">
              <h3>{{ $t('Email') }}:</h3>
              <p class="body-text text-gray-500">
                {{ order.user?.data.email }}
              </p>
            </div>
          </div>
        </div>
        <div class="right flex flex-col items-end gap-4">
          <h2 class="text-blue-950">
            {{ $t('Providing_by') }}
          </h2>
          <div class="flex flex-col items-end gap-2">
            <div class="flex gap-4">
              <p class="body-text text-gray-500">Samaria Drinks SRL</p>
            </div>
            <div class="flex gap-4">
              <p class="body-text text-gray-500">Doornveld 114 , 1731 Asse</p>
            </div>
            <div class="flex gap-4">
              <p class="body-text text-gray-500">+32 484 43 11 42</p>
            </div>
            <div class="flex gap-4">
              <p class="body-text text-gray-500">info@samariadrinks.be</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="order-part flex justify-between">
      <div class="left flex flex-col gap-4">
        <h2 class="text-[var(--neutral-400)]">
          {{ $t('Order_Details') }}
        </h2>
        <div class="flex flex-col gap-2">
          <div class="flex gap-4">
            <h3>{{ $t('Order_ID') }}:</h3>
            <p class="body-text text-gray-500">
              {{ order.id }}
            </p>
          </div>
          <div class="flex gap-4">
            <h3>{{ $t('Order_Date') }}:</h3>
            <p class="body-text text-gray-500">
              {{ order.order_date?.split('T')[0] }}
            </p>
          </div>
          <div class="flex gap-4">
            <h3>{{ $t('Delivery_Date') }}:</h3>
            <p class="body-text text-gray-500">
              {{ order.order_date }}
            </p>
          </div>
        </div>
        <div>
          <OrdersStatusSelect
            v-if="!isHistory"
            :selected="order.status"
            @select="
              async ($event) => {
                await ordersStore.actionUpdateOrderStatus($event.id, order.id)
                ordersStore.actionGetOrderCustom(Number(route.params.id))
              }
            "
            container-class="!w-full"
            :disabled-status="order.missing ? 'On_the_way' : ''"
          />
        </div>
        <div class="mt-auto flex gap-4">
          <RouterLink
            :to="`/admin/sell/orders/edit/${order.id}`"
            :class="
              buttonVariants({
                className:
                  (order.status > 2 || isHistory) &&
                  'pointer-events-none opacity-0',
              })
            "
          >
            {{ $t('Edit_Order') }}
          </RouterLink>
          <Button variant="outline" @click="downloadPDF">
            {{ $t('Download_PDF') }}
          </Button>
        </div>
      </div>
      <div
        class="right body-text w-full max-w-[840px] rounded-sm border border-[var(--neutral-200)]"
      >
        <table class="w-full">
          <thead>
            <tr
              class="bg-[var(--neutral-200)] text-left [&>th]:px-4 [&>th]:py-2.5"
            >
              <th>{{ $t('Product_Name') }}</th>
              <th>{{ $t('Quantity') }}</th>
              <th>{{ $t('Price__Pack') }}</th>
              <th>{{ $t('Promotion') }}</th>
              <th>{{ $t('Total_Price') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="orderItem in order.orderItems?.data">
              <!-- Main product row -->
              <tr
                :class="
                  cn(
                    '[&>td]:px-4 [&>td]:py-2.5',
                    !orderItem.batchItem?.data?.product?.data?.related_products
                      ?.length && 'border-b border-[var(--neutral-200)]',
                    false && 'bg-amber-50'
                  )
                "
              >
                <td class="text-gray-500">
                  <div class="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <div v-if="!isHistory">
                            <CircleAlert
                              v-if="
                                order.missing_product_list?.some(
                                  (missingProduct) =>
                                    missingProduct.missing_product_name ===
                                    orderItem.batchItem?.data?.product?.data
                                      ?.name
                                )
                              "
                              :size="18"
                              class="text-[var(--status)]"
                            />
                            <CircleAlert
                              v-else-if="order.missing_product_list.length"
                              :size="18"
                              class="pointer-events-none opacity-0"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quantity issue</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {{ orderItem.batchItem?.data?.product?.data?.name }}
                  </div>
                </td>
                <td class="text-gray-500">
                  <span v-if="Number(orderItem.pallet_quantity) > 0">
                    {{ orderItem.pallet_quantity }}
                    {{ $t('pallet') }}
                  </span>
                  <span v-if="Number(orderItem.pack_quantity) > 0">
                    {{ ' ' }}{{ orderItem.pack_quantity }}
                    {{ $t('pack') }}
                  </span>
                </td>
                <td
                  :class="{
                    '':
                      orderItem.product_promotion_amount &&
                      Number(orderItem?.product_promotion_discount) > 0,
                    'text-gray-500': true,
                  }"
                >
                  {{ formatCurrency(orderItem?.price_per_pack) }}
                </td>
                <td class="font-bold text-destructive">
                  <div
                    v-if="
                      (Number(orderItem?.product_promotion_discount) > 0 ||
                        Number(orderItem?.product_promotion_amount) > 0) &&
                      !orderItem.batchItem?.data?.product?.data?.is_user_tariff
                    "
                  >
                    <span v-if="Number(orderItem?.promotion_type) == 1"
                      >{{
                        Number(orderItem?.product_promotion_amount).toFixed(0)
                      }}%</span
                    >
                    <span v-else-if="Number(orderItem?.promotion_type) == 2">
                      {{
                        formatCurrency(orderItem?.product_promotion_amount)
                      }}</span
                    >
                  </div>
                </td>
                <td class="text-gray-500">
                  {{ formatCurrency(orderItem?.final_price) }}
                </td>
              </tr>
              <!-- Related products -->
              <template
                v-if="
                  orderItem.batchItem?.data?.product?.data?.related_products
                    ?.length
                "
              >
                <tr
                  v-for="(relatedProduct, index) in orderItem.batchItem?.data
                    ?.product?.data?.related_products"
                  :class="[
                    'text-sm [&>td]:px-4 [&>td]:py-2',
                    index ===
                    orderItem.batchItem?.data?.product?.data?.related_products
                      .length -
                      1
                      ? 'border-b border-[var(--neutral-200)]'
                      : '',
                  ]"
                >
                  <td class="py-2 text-gray-500">
                    {{ relatedProduct.related_product.name }}
                  </td>
                  <td class="text-gray-500">
                    {{
                      calculateRelatedProductQuantity(relatedProduct, orderItem)
                    }}
                  </td>
                  <td></td>
                  <td></td>
                  <td class="text-gray-500">
                    {{
                      formatCurrency(
                        calculateRelatedProductPrice(relatedProduct, orderItem)
                      )
                    }}
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
          <tfoot>
            <!-- Subtotal row -->
            <tr
              class="border-b border-[var(--neutral-200)] bg-[var(--neutral-100)] [&>td]:px-4 [&>td]:py-2.5"
            >
              <td>{{ $t('Subtotal') }}</td>
              <td colspan="3"></td>
              <td>
                {{ formatCurrency(order.order_subtotal_price) }}
              </td>
            </tr>
            <!-- Promotion discount row -->
            <tr
              v-if="Number(order.product_promotion_total_discount) > 0"
              class="border-b border-[var(--neutral-200)] bg-[var(--neutral-100)] [&>td]:px-4 [&>td]:py-2.5"
            >
              <td>{{ $t('Promotion') }}</td>
              <td colspan="3"></td>
              <td>
                {{
                  '-' + formatCurrency(order.product_promotion_total_discount)
                }}
              </td>
            </tr>
            <!-- Shipping cost row -->
            <tr
              class="border-b border-[var(--neutral-200)] bg-[var(--neutral-100)] [&>td]:px-4 [&>td]:py-2.5"
            >
              <td>{{ $t('Shipping_cost') }}</td>
              <td colspan="3"></td>
              <td class="whitespace-nowrap">
                {{ formatCurrency(order.total_shipping_cost) }}
              </td>
            </tr>
            <!-- Total row -->
            <tr class="bg-[var(--neutral-200)] [&>td]:px-4 [&>td]:py-2.5">
              <td class="text-xl font-semibold">
                {{ $t('Total_Price') }}
              </td>
              <td colspan="3"></td>
              <td class="text-xl font-semibold">
                {{ formatCurrency(order.order_total_price) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order {
  .divider {
    background: var(--neutral-100);
    height: 11px;
  }

  .head-part {
    padding: 32px;
  }

  .order-part {
    padding: 48px 32px 32px;

    .left {
      max-width: 390px;
    }

    .download {
      margin-top: auto;
    }
  }
}
</style>
