<script setup lang="ts">
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes.ts'
import { TOrdersErrors } from '@/modules/sell/orders/store/types/ordersTypes.ts'
import { useOrdersStore } from '@/modules/sell/orders/store/orders.ts'
import IconMinus from '@/components/icons/IconMinus.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIRadioInput from '@/components/ui/inputs/UIRadioInput.vue'
import { useRefundsStore } from '@/modules/sell/refund/store/refund.ts'
import { TCustomer } from '@/modules/sell/customer/store/types/customerTypes.ts'
import { formatCurrency, parseEuroCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import IconPlus20 from '@/components/icons/IconPlus20.vue'

const stockStore = useStockStore()
const ordersStore = useOrdersStore()
const refundsStore = useRefundsStore()
const { filters, orders } = storeToRefs(ordersStore)
const { stocks } = storeToRefs(stockStore)
const refundErrors = ref({} as TOrdersErrors)
const refundFormData = ref({
  stock: {
    id: '',
  },
  order: {
    user_id: '',
    id: '',
    user: {} as TCustomer,
    orderItems: { data: [] },
  },
  refund_date: '',
  refund_to_balance: 0,
  data: [
    {
      product: {} as TProduct,
      quantity: '',
      cost: '',
    },
  ],
})

const addRefundProduct = () => {
  refundFormData.value.data.push({
    product: {} as TProduct,
    quantity: '',
    cost: '',
  })
}

const removeRefundProduct = (index: number) => {
  refundFormData.value.data.splice(index, 1)
}

const selectProduct = (e: TProduct, index: number) => {
  refundFormData.value.data[index].product = e
  refundFormData.value.data[index].cost = formatCurrency(
    refundFormData.value.data[index].product.price_per_pack,
    true,
    true
  )
  refundFormData.value.data[index].quantity = ''
}

const updateQuantity = (e: string, index: number) => {
  const quantity = refundFormData.value.data[index].product.quantity
  refundErrors.value = {} as TOrdersErrors
  if (Number(quantity) >= Number(e)) {
    refundFormData.value.data[index].quantity = e
  } else {
    refundFormData.value.data[index].quantity = String(quantity)
    refundErrors.value[`products.${index}.quantity`] =
      `max quantity is ${quantity}`
  }
}

const compProduct = computed(() => {
  return refundFormData.value?.order?.orderItems?.data.map((item) => {
    return {
      ...item.batch_item.product,
      quantity: item.quantity,
      price_per_pack: item.price_per_pack,
    }
  })
})

const submit = async () => {
  refundErrors.value = {} as TOrdersErrors

  const refundParams = {
    user_id: refundFormData.value.order.user_id,
    stock_id: refundFormData.value.stock.id,
    order_id: refundFormData.value.order.id,
    refund_to_balance: refundFormData.value.refund_to_balance,
    refund_date: refundFormData.value.refund_date,
    products: refundFormData.value.data.map((item) => {
      return {
        id: item.product.id,
        quantity: item.quantity,
        cost: parseEuroCurrency(item.cost),
      }
    }),
  }
  const refundData = await refundsStore.actionCreateRefund(refundParams)

  if (refundData?.status == 201) {
    refundFormData.value = {
      stock: {
        id: '',
      },
      order: {
        user_id: '',
        id: '',
        user: {} as TCustomer,
        orderItems: { data: [] },
      },
      refund_date: '',
      refund_to_balance: 0,
      data: [
        {
          product: {} as TProduct,
          quantity: '',
          cost: '',
        },
      ],
    }
  } else {
    Object.keys(refundData.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        refundErrors.value[item] = refundData.response.data.errors[item][0]
          .replace(/products\.\d+\.cost/g, 'cost')
          .replace(/products\.\d+\.quantity/g, 'quantity')
          .replace('user id', 'order')
          .replace('order id', 'order')
          .replace('stock id', 'stock')
          .replace('refund_date', 'refund date')
          .replace(/products\.\d+\.product_id/g, 'product')
          .replace(/products\.\d+\.price/g, 'price')
      }
    })
  }
}

onMounted(async () => {
  ordersStore.$reset()
  filters.value['delivered'].per_page = 99999
  filters.value['delivered']['include[]'] = ['orderItemProduct']
  await ordersStore.actionGetOrders('delivered')
})
</script>

<template>
  <div class="refund-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Refund_a_product(s)') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <div class="refund-content gap-4">
            <SingleSelect
              @click="refundErrors = {} as TOrdersErrors"
              :error="refundErrors.stock_id"
              :placeholder="`${$t('Choose_a_stock')} *`"
              :data="stocks"
              :show-key="'name'"
              :none="false"
              :selected="refundFormData.stock"
              @select="refundFormData.stock = $event"
              :is-dirty="true"
            />
            <UIInput
              :disabled="true"
              :placeholder="`${$t('Client')}`"
              :model-value="refundFormData.order?.user?.company"
              :is-dirty="true"
            />
            <SingleSelect
              @click="refundErrors = {} as TOrdersErrors"
              :error="refundErrors.user_id"
              :placeholder="`${$t('Order_Number')} *`"
              :data="orders.delivered.data"
              :show-key="'id'"
              :none="false"
              :selected="refundFormData.order"
              @select="refundFormData.order = $event"
              :is-dirty="true"
            />
            <UIInputDate
              @click="refundErrors = {} as TOrdersErrors"
              :error="refundErrors.refund_date"
              :placeholder="`${$t('Refund_date')} *`"
              v-model="refundFormData.refund_date"
              :is-dirty="true"
            />
          </div>
          <div
            class="refund-products"
            v-for="(form, index) in refundFormData.data"
          >
            <SingleSelect
              @click="refundErrors = {} as TOrdersErrors"
              :error="refundErrors[`products.${index}.product_id`]"
              :placeholder="`${$t('Choose_product')} *`"
              :data="compProduct"
              :show-key="'name'"
              :none="false"
              :selected="form.product"
              @select="selectProduct($event, index)"
              :is-dirty="true"
            />
            <UIInput
              :model-value="form.quantity"
              :disabled="!form.product.id"
              :error="refundErrors[`products.${index}.quantity`]"
              input-type="number"
              :limit="true"
              :placeholder="`${$t('QNT')} *`"
              @update:model-value="updateQuantity($event, index)"
              :is-dirty="true"
            />
            <UIInput
              v-model="form.cost"
              :disabled="!form.product.id"
              :error="refundErrors[`products.${index}.cost`]"
              :placeholder="`${$t('Cost')} *`"
              symbol="€"
              @update:model-value="refundErrors = {} as TOrdersErrors"
              :is-dirty="true"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
              @click="removeRefundProduct(Number(index))"
              v-if="refundFormData.data?.length > 1"
            >
              <IconMinus />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            class="h-8 self-start px-2"
            @click="addRefundProduct"
          >
            <IconPlus20 />
            <span class="body-text-2"> {{ $t('Add_product') }}</span>
          </Button>
          <div class="pay-off ms-2 flex gap-8">
            <UIRadioInput
              v-model="refundFormData.refund_to_balance"
              :label="$t('Pay_off')"
              name="pay"
              :inputValue="0"
            />
            <UIRadioInput
              v-model="refundFormData.refund_to_balance"
              :label="$t('Add_amount_to_the_balance')"
              name="pay"
              :inputValue="1"
            />
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Save') }}</UIButton>
          <UIButton type="button" types="cancel" @click="$router.go(-1)">
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.refund-create {
  padding: 32px;

  .form-content {
    margin-top: 50px;
    max-width: 792px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      position: relative;

      .icon-plus {
        color: var(--primary-500);
      }

      .refund-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .refund-products {
        display: grid;
        grid-template-columns: 290px 138px 138px 138px 24px;
        gap: 12px 16px;
      }
    }
  }
}
</style>
