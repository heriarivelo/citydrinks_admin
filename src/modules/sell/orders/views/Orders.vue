<script setup lang="ts">
import PaymentDialog from '@/components/payment/PaymentDialog.vue'
import UITable from '@/components/table/UITable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import OrdersStatusSelect from '@/components/ui/selects/OrdersStatusSelect.vue'
import { cn, formatCurrency, parseNumber } from '@/lib/utils'
import { useOrdersStore } from '@/modules/sell/orders/store/orders.ts'
import { ArrowDownFromLine, CircleAlert, Eye, Pencil } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import OrderDebts from './OrderDebts.vue'
import NoData from '@/components/table/NoData.vue'
import { useQueryClient } from '@tanstack/vue-query'

const ordersStore = useOrdersStore()
const { orders, filters, approvedCount } = storeToRefs(ordersStore)
const fullScreenType = ref('')
const queryClient = useQueryClient()
const pageChange = (e: number, type: string) => {
  filters.value[type].page = e
  ordersStore.actionGetOrders(type)
}

const search = () => {}

const ordersApprovedMissingLength = computed(
  () => orders.value.approved?.missing_products?.length || 0
)

const fullScreen = (type: string) => {
  if (fullScreenType.value === type) {
    ordersStore.actionResetFilter()
    ordersStore.actionInitOrders()
    fullScreenType.value = ''
    return
  }
  ordersStore.actionResetFilter()
  fullScreenType.value = type
  filters.value[type] = {
    ...filters.value[type],
    per_page: 10,
  }
  ordersStore.actionGetOrders(type)
}

const updateOrderStatus = async (
  statusId: number,
  orderId: number,
  type: string
) => {
  await ordersStore.actionUpdateOrderStatus(statusId, orderId)
  const currentPage = orders.value[type]?.meta?.pagination?.current_page
  const data = orders.value[type]?.data
  if (data?.length === 0) {
    pageChange(currentPage - 1, type)
  }
  queryClient.invalidateQueries({ queryKey: ['debts'] })
  queryClient.invalidateQueries({
    queryKey: ['payments-sell'],
  })
  queryClient.invalidateQueries({
    queryKey: ['customers'],
  })
  queryClient.invalidateQueries({
    queryKey: ['transfer'],
  })
  queryClient.invalidateQueries({ queryKey: ['transfer-status'] })
}

onMounted(async () => {
  ordersStore.$reset()
  await ordersStore.actionInitOrders()
  await ordersStore.actionGetSeeAll()
})
</script>

<template>
  <div v-if="true" class="orders flex flex-col gap-[26px]">
    <div class="header flex justify-end">
      <div class="flex gap-2">
        <UIInput icon="search" :placeholder="$t('Search')" @input="search" />
        <UIButton @click="$router.push('/admin/sell/orders/create')">{{
          $t('New_Order')
        }}</UIButton>
        <Button variant="ghost" class="text-[var(--neutral-400)]">
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
    <div
      v-if="!fullScreenType || fullScreenType === 'waiting'"
      class="flex flex-col gap-4"
    >
      <h2 class="uppercase">{{ $t('Waiting') }}</h2>
      <div
        :class="
          cn(
            'custom-scrollbar overflow-y-auto',
            fullScreenType ? 'max-h-auto' : 'max-h-[226px]'
          )
        "
      >
        <UITable :full-screen="true" @fullScreen="fullScreen('waiting')">
          <template v-slot:thead>
            <tr>
              <td>{{ $t('ID') }}</td>
              <td>{{ $t('Customer') }}</td>
              <td>{{ $t('Order_Date') }}</td>
              <td>{{ $t('Address') }}</td>
              <td>{{ $t('Total_Price') }}</td>
              <td class="text-center">{{ $t('Status') }}</td>
              <td>{{ $t('Actions') }}</td>
            </tr>
          </template>
          <template v-slot:t-row>
            <tr
              v-if="orders.waiting?.data?.length"
              v-for="order in orders.waiting.data"
            >
              <td>{{ order?.id }}</td>
              <td>{{ order?.user?.company }}</td>
              <td>{{ order.order_date?.split('T')[0] }}</td>
              <td>{{ order.address }}</td>
              <td>{{ formatCurrency(order.order_total_price) }}</td>
              <td>
                <OrdersStatusSelect
                  :selected="order.status"
                  @select="updateOrderStatus($event.id, order.id, 'waiting')"
                />
              </td>
              <td class="!py-0">
                <div class="flex items-center justify-center">
                  <RouterLink
                    :to="`/admin/sell/orders/${order.id}`"
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
                    :isButtonDisabled="order.paid ? true : false"
                    :payment-item="{
                      order_id: order.id,
                      date: order.order_date,
                      balance:
                        parseNumber(order.order_total_price) -
                        order.paid_amount,
                      company: order.user?.company,
                    }"
                    icon="wallet"
                  />
                  <RouterLink
                    :to="`/admin/sell/orders/edit/${order.id}`"
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
                  >
                    <ArrowDownFromLine />
                  </Button>
                </div>
              </td>
            </tr>
            <NoData v-else />
          </template>
        </UITable>
      </div>
      <Pagination
        :currentPage="orders.waiting?.meta?.pagination?.current_page"
        :totalPages="orders.waiting?.meta?.pagination?.total_pages"
        v-if="orders.waiting?.meta?.pagination?.total_pages > 1"
        @page-change="pageChange($event, 'waiting')"
      />
    </div>
    <div
      v-if="!fullScreenType || fullScreenType === 'approved'"
      class="flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="uppercase">
          {{ $t('Approved') }}-{{ approvedCount.pallet }}PL,{{
            approvedCount.pack
          }}PK
        </h2>
        <UIButton
          v-if="!fullScreenType"
          type="button"
          types="cancel"
          @click="$router.push('see-all')"
          >{{ $t('See_All') }}
        </UIButton>
      </div>
      <div
        v-if="ordersApprovedMissingLength"
        class="flex items-center gap-2 bg-[var(--status-1)] px-4 py-2"
      >
        <CircleAlert :size="20" class="shrink-0 text-[var(--status)]" />
        <p>
          The
          {{ ordersApprovedMissingLength }}
          {{
            ordersApprovedMissingLength == 1
              ? $t('approved_product')
              : $t('approved_products')
          }}
          —
          <span
            v-for="(order, index) in orders.approved?.missing_products"
            :key="order.missing_product_id"
            >{{ order.missing_product_name
            }}<span v-if="index < ordersApprovedMissingLength - 1"
              >,
            </span></span
          >
          —
          {{
            ordersApprovedMissingLength == 1
              ? $t('has_a_quantity_issue')
              : $t('have_a_quantity_issue')
          }}.
        </p>
      </div>
      <div
        :class="
          cn(
            'custom-scrollbar overflow-y-auto',
            fullScreenType ? 'max-h-auto' : 'max-h-[226px]'
          )
        "
      >
        <UITable :full-screen="true" @fullScreen="fullScreen('approved')">
          <template v-slot:thead>
            <tr>
              <td>{{ $t('ID') }}</td>
              <td>{{ $t('Customer') }}</td>
              <td>{{ $t('Order_Date') }}</td>
              <td>{{ $t('Address') }}</td>
              <td>{{ $t('Total_Price') }}</td>
              <td class="text-center">{{ $t('Status') }}</td>
              <td>{{ $t('Actions') }}</td>
            </tr>
          </template>
          <template v-slot:t-row>
            <tr
              v-if="orders.approved?.data?.length"
              v-for="order in orders.approved.data"
            >
              <td>
                <div class="flex items-center gap-2">
                  <CircleAlert
                    v-if="
                      order.missing_product_list &&
                      order.missing_product_list.length > 0
                    "
                    :size="18"
                    class="text-[var(--status)]"
                  />
                  <div
                    v-else-if="ordersApprovedMissingLength"
                    class="w-4"
                  ></div>
                  {{ order?.id }}
                </div>
              </td>
              <td>{{ order?.user?.company }}</td>
              <td>{{ order.order_date?.split('T')[0] }}</td>
              <td>{{ order.address }}</td>
              <td>{{ formatCurrency(order.order_total_price) }}</td>
              <td>
                <OrdersStatusSelect
                  :selected="order.status"
                  @select="updateOrderStatus($event.id, order.id, 'approved')"
                  :disabled-status="
                    order.missing || !order.transfer_is_delivered
                      ? 'On_the_way'
                      : ''
                  "
                />
              </td>
              <td class="!py-0">
                <div class="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="iconMd"
                    class="text-[var(--neutral-400)]"
                    @click="$router.push(`/admin/sell/orders/${order.id}`)"
                  >
                    <Eye />
                  </Button>
                  <PaymentDialog
                    :isButtonDisabled="order.paid ? true : false"
                    :payment-item="{
                      order_id: order.id,
                      date: order.order_date,
                      balance:
                        parseNumber(order.order_total_price) -
                        order.paid_amount,
                      company: order.user.company,
                    }"
                    icon="wallet"
                  />
                  <RouterLink
                    :to="`/admin/sell/orders/edit/${order.id}`"
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
                  >
                    <ArrowDownFromLine />
                  </Button>
                </div>
              </td>
            </tr>
            <NoData v-else />
          </template>
        </UITable>
      </div>
      <Pagination
        :currentPage="orders.approved?.meta?.pagination?.current_page"
        :totalPages="orders.approved?.meta?.pagination?.total_pages"
        v-if="orders.approved?.meta?.pagination?.total_pages > 1"
        @page-change="pageChange($event, 'approved')"
      />
    </div>
    <div
      v-if="!fullScreenType || fullScreenType === 'on_the_way'"
      class="flex flex-col gap-4"
    >
      <h2 class="uppercase">{{ $t('On_The_Way') }}</h2>
      <div
        :class="
          cn(
            'custom-scrollbar overflow-y-auto',
            fullScreenType ? 'max-h-auto' : 'max-h-[226px]'
          )
        "
      >
        <UITable :full-screen="true" @fullScreen="fullScreen('on_the_way')">
          <template v-slot:thead>
            <tr>
              <td>{{ $t('ID') }}</td>
              <td>{{ $t('Customer') }}</td>
              <td>{{ $t('Order_Date') }}</td>
              <td>{{ $t('Address') }}</td>
              <td>{{ $t('Total_Price') }}</td>
              <td class="text-center">{{ $t('Status') }}</td>
              <td>{{ $t('Actions') }}</td>
            </tr>
          </template>
          <template v-slot:t-row>
            <tr
              v-if="orders.on_the_way?.data?.length"
              v-for="order in orders.on_the_way.data"
            >
              <td>
                {{ order?.id }}
              </td>
              <td>{{ order?.user?.company }}</td>
              <td>{{ order.order_date?.split('T')[0] }}</td>
              <td>{{ order.address }}</td>
              <td>{{ formatCurrency(order.order_total_price) }}</td>
              <td>
                <OrdersStatusSelect
                  :selected="order.status"
                  @select="updateOrderStatus($event.id, order.id, 'on_the_way')"
                />
              </td>
              <td class="!py-0">
                <div class="flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="iconMd"
                    class="text-[var(--neutral-400)]"
                    @click="$router.push(`/admin/sell/orders/${order.id}`)"
                  >
                    <Eye />
                  </Button>
                  <PaymentDialog
                    :isButtonDisabled="order.paid ? true : false"
                    :payment-item="{
                      order_id: order.id,
                      date: order.order_date,
                      balance:
                        parseNumber(order.order_total_price) -
                        order.paid_amount,
                      company: order.user.company,
                    }"
                    icon="wallet"
                  />
                  <Button
                    variant="ghost"
                    size="iconMd"
                    class="text-[var(--neutral-400)]"
                  >
                    <ArrowDownFromLine />
                  </Button>
                </div>
              </td>
            </tr>
            <NoData v-else />
          </template>
        </UITable>
      </div>
      <Pagination
        :currentPage="orders.on_the_way?.meta?.pagination?.current_page"
        :totalPages="orders.on_the_way?.meta?.pagination?.total_pages"
        v-if="orders.on_the_way?.meta?.pagination?.total_pages > 1"
        @page-change="pageChange($event, 'on_the_way')"
      />
    </div>

    <OrderDebts :full-screen-type="fullScreenType" />
  </div>
</template>

<style scoped>
.orders {
  padding: 32px;

  .header {
    margin-bottom: -47px;
    z-index: 1;
  }

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
