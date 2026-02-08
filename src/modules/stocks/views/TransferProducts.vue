<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { useRoute, useRouter } from 'vue-router'
import IconMinus from '@/components/icons/IconMinus.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import { TBatchTransferErrors } from '@/modules/stocks/store/types/batchTypes.ts'
import { TStock } from '@/modules/stocks/store/types/stockTypes.ts'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import { Button } from '@/components/ui/button'
import { useModalStore } from '@/store/modal'
import { useQueryClient } from '@tanstack/vue-query'

dayjs.extend(customParseFormat)

const stockStore = useStockStore()
const productStore = useProductStore()
const batchStore = useBatchStore()
const { transferProducts } = storeToRefs(productStore)
const modalStore = useModalStore()
const { stocks } = storeToRefs(stockStore)
const route = useRoute()
const router = useRouter()
const stockFrom = ref({} as TStock)
const stockTo = ref({} as TStock)
const errors = ref({} as TBatchTransferErrors)
const queryClient = useQueryClient()
const isSubmitting = ref(false)
const selectedProducts = ref([
  {
    quantity: '',
    selected_product: {} as any,
    lot_number: {} as any,
  },
])
const selectedProductItem = {
  quantity: '',
  selected_product: {} as any,
  lot_number: {} as any,
}

const compStocks = computed(() => {
  return stocks.value.filter(
    (item) => item.id !== stockFrom.value?.id && item.id !== stockTo.value.id
  )
})

const compQuantity = computed(() => {
  return selectedProducts.value?.map((item: any) => {
    return item.quantity
      ? `${Math.trunc(item.quantity / item.selected_product.packs_quantity_per_pallet) + ' PL ' + (item.quantity % item.selected_product.packs_quantity_per_pallet) + ' PK'}`
      : ''
  })
})

const removeProduct = (index: number) => {
  if (selectedProducts.value.length > 1) {
    errors.value = {} as TBatchTransferErrors
    selectedProducts.value.splice(index, 1)
  }
}

const addProduct = async () => {
  selectedProducts.value.push(JSON.parse(JSON.stringify(selectedProductItem)))
}

const selectProduct = (product: any, index: number) => {
  selectedProducts.value[index].selected_product = product
  selectedProducts.value[index].lot_number =
    product.batch_items?.reduce((min, item) => {
      const itemExpireDate = new Date(
        dayjs(item.expiry_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
      )
      const minExpireDate = new Date(
        dayjs(min.expiry_date, 'DD-MM-YYYY').format('YYYY-MM-DD')
      )
      return itemExpireDate < minExpireDate ? item : min
    }, product.batch_items[0]) || {}
  selectedProducts.value[index].quantity = ''
}

const updateQuantity = (e: string, index: number) => {
  const quantity = selectedProducts.value[index].lot_number.quantity
  errors.value = {} as TBatchTransferErrors
  if (quantity >= Number(e)) {
    selectedProducts.value[index].quantity = e
  } else {
    selectedProducts.value[index].quantity = String(quantity)
    errors.value[`batch_items.${index}.quantity`] =
      `max quantity is ${quantity}`
  }
}

const submit = async () => {
  isSubmitting.value = true
  let params = {
    sender_stock_id: stockFrom.value?.id,
    receiver_stock_id: stockTo.value?.id,
    batch_items: selectedProducts.value?.map((item) => {
      return {
        id: item.lot_number?.id,
        quantity: item?.quantity,
        lot_number: item?.lot_number?.lot_number,
      }
    }),
  }
  const data = await batchStore.transferProducts(params)
  if (!data.response?.data?.error_code) {
    modalStore.setIsFormDirty(false)
    queryClient.invalidateQueries({ queryKey: ['transfer-status'] })
    router.push('/admin/stocks/transfer-status')
  } else {
    if (data.response.data?.errors) {
      Object.keys(data.response.data.errors).forEach((item, index) => {
        if (index == 0) {
          errors.value[item] = data.response.data.errors[item][0]
            .replace(/batch_items\.\d+\.lot_number/g, 'lot number')
            .replace(/batch_items\.\d+\.id/g, 'lot number')
            .replace(/batch_items\.\d+\.quantity/g, 'quantity')
            .replace('receiver_stock_id', 'receiver stock')
            .replace('sender_stock_id', 'sender stock')
        }
      })
    }
  }
  isSubmitting.value = false
}

onMounted(async () => {
  productStore.$reset()
  if (!stocks.value.length) {
    await stockStore.actionGetStocks()
  }
  stockFrom.value = stocks.value.filter((item) => {
    return item.id == route.params.stock
  })?.[0]
  await productStore.actionGetProductsForTransfer({
    stock_id: route.params.stock,
  })
  if (route.params.product_id) {
    selectedProducts.value[0].selected_product =
      transferProducts.value?.data?.filter((item: any) => {
        return item.id == route.params.product_id
      })?.[0]
    selectedProducts.value[0].lot_number =
      selectedProducts.value[0].selected_product?.batch_items?.[0] || {}
  }
})

onUnmounted(() => {
  productStore.$reset()
})
</script>

<template>
  <div class="transfer-products">
    <form class="flex flex-col gap-10" @submit.prevent="submit">
      <div class="data flex flex-col gap-6">
        <h1>{{ $t('Transfer_product(s)') }}</h1>
        <div class="flex flex-col gap-4">
          <div class="stocks-select flex gap-4">
            <SingleSelect
              @keydown.enter.prevent
              @click="errors = {} as TBatchTransferErrors"
              class="w-full"
              :showFromSelected="true"
              :placeholder="`${$t('From_Name_stock')} *`"
              :data="compStocks"
              :show-key="'name'"
              :selected="stockFrom"
              @select="
                async (event) => {
                  stockFrom = event
                  selectedProducts = [
                    {
                      quantity: '',
                      selected_product: {} as any,
                      lot_number: {} as any,
                    },
                  ]
                  errors = {} as TBatchTransferErrors
                  await productStore.actionGetProductsForTransfer({
                    stock_id: event.id,
                  })
                }
              "
              :error="errors.sender_stock_id"
              :is-dirty="true"
              :none="false"
            />
            <SingleSelect
              @keydown.enter.prevent
              @click="errors = {} as TBatchTransferErrors"
              class="w-full"
              :showFromSelected="true"
              :placeholder="`${$t('To_Name_stock')} *`"
              :data="compStocks"
              :show-key="'name'"
              :selected="stockTo"
              @select="stockTo = $event"
              :error="errors.receiver_stock_id"
              :is-dirty="true"
              :none="false"
            />
          </div>
          <div
            class="add-products"
            v-for="(product, index) in selectedProducts"
          >
            <SearchSelect
              @keydown.enter.prevent
              :showFromSelected="true"
              :placeholder="`${$t('Choose_product')} *`"
              :error="errors[`order_items.${index}.product_id`]"
              :data="transferProducts?.data"
              :none="false"
              :selected="product.selected_product"
              @select="selectProduct($event, index)"
              :show-key="'name'"
              :is-dirty="true"
            />
            <UIInput
              @keydown.enter.prevent
              @update:model-value="updateQuantity($event, index)"
              @click="errors = {} as TBatchTransferErrors"
              :error="errors[`batch_items.${index}.quantity`]"
              :limit="true"
              :input-type="'number'"
              :disabled="
                !product.selected_product?.id || !product.lot_number?.id
              "
              :model-value="product.quantity"
              :placeholder="`${$t('QNT__(Pack)')}`"
              :is-dirty="true"
            />
            <SingleSelect
              @keydown.enter.prevent
              :showFromSelected="true"
              :placeholder="`${$t('Lot_Number')}`"
              :error="
                errors[`batch_items.${index}.lot_number`] ||
                errors[`batch_items.${index}.id`]
              "
              @click="errors = {} as TBatchTransferErrors"
              :data="product.selected_product?.batch_items"
              :none="false"
              :selected="product.lot_number"
              @select="product.lot_number = $event"
              :show-key="'lot_number'"
              :is-dirty="true"
            />
            <UIInputDate
              :disabled="true"
              :placeholder="`${$t('Expire_Date')} *`"
              v-model="product.lot_number.expiry_date"
              :is-dirty="true"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
              @click="removeProduct(Number(index))"
              v-if="selectedProducts.length > 1"
            >
              <IconMinus />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            class="h-8 self-start px-2"
            @click="addProduct"
          >
            <IconPlus20 />
            <span class="body-text-2"> {{ $t('Add_product') }}</span>
          </Button>
        </div>
      </div>
      <div class="actions flex w-full justify-end gap-4">
        <UIButton :disabled="isSubmitting">{{ $t('Transfer') }}</UIButton>
        <UIButton type="button" types="cancel" @click="$router.go(-1)"
          >{{ $t('Go_Back') }}
        </UIButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.transfer-products {
  max-width: 900px;
  margin: 104px auto auto;

  .data {
    h1 {
      margin: auto;
    }

    .stocks-select {
      padding: 16px;
      background: var(--neutral-200);
      border-radius: 4px;

      .select-content {
        background: var(--white);
      }
    }

    .add-products {
      display: grid;
      gap: 16px;
      grid-template-columns: 1fr 140px 140px 161px 24px;
    }
  }
}
</style>
