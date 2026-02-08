<script setup lang="ts">
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { storeToRefs } from 'pinia'
import { TProvider } from '@/modules/buy/providers/store/types/providerTypes.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { TStock } from '@/modules/stocks/store/types/stockTypes.ts'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import IconMinus from '@/components/icons/IconMinus.vue'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes.ts'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { SHOW_TO_CLIENT } from '@/modules/stocks/constants.ts'
import { useRoute, useRouter } from 'vue-router'
import { TBatchErrors } from '@/modules/stocks/store/types/batchTypes.ts'
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import { formatDate } from '@/utils/dateUtils.ts'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import { formatCurrency, parseEuroCurrency, parseNumber } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { useQueryClient } from '@tanstack/vue-query'

const router = useRouter()
const route = useRoute()
const batchStore = useBatchStore()
const providersStore = useProvidersStore()
const stockStore = useStockStore()
const modalStore = useModalStore()
const productStore = useProductStore()
const relatedStore = useRelatedStore()
const authStore = useAdminAuthStore()
const { me } = storeToRefs(authStore)
const { providers } = storeToRefs(providersStore)
const { stocks } = storeToRefs(stockStore)
const { products } = storeToRefs(productStore)
const { relatedProducts } = storeToRefs(relatedStore)
const errors = ref({} as TBatchErrors)
const internal_code = ref('')
const available_date = ref('')
const selectedProvider = ref({} as TProvider)
const selectedStock = ref({} as TStock)
const show_to_client = ref(SHOW_TO_CLIENT[0])
const queryClient = useQueryClient()
const isSubmitting = ref(false)
const batchData = ref([
  {
    selected_product: {} as TProduct,
    quantity: '',
    expiry_date: '',
    lot_number: '',
    cost: '',
    total: '',
  },
])
const batchItem = {
  selected_product: {},
  quantity: '',
  expiry_date: '',
  lot_number: '',
  cost: '',
  total: '',
}

const compTotal = computed(() => {
  let totalData = []
  batchData.value.forEach((item, index) => {
    if (item?.cost && item?.quantity) {
      let total: string | number
      total = parseEuroCurrency(item.cost) * parseEuroCurrency(item.quantity)
      totalData[index] = formatCurrency(total, true, true)
    }
  })
  return totalData
})

const compProducts = computed(() => {
  return products.value?.data && relatedProducts.value?.data
    ? [
        ...products.value?.data?.filter((item: any) => (item.isProduct = true)),
        ...relatedProducts.value?.data?.filter(
          (item: any) => (item.isRelatedProduct = true)
        ),
      ]
    : []
})

const addProduct = async () => {
  batchData.value.push(JSON.parse(JSON.stringify(batchItem)))
  batchData.value[batchData.value.length - 1].lot_number =
    await batchStore.actionGetLotNumber()
}

const removeProduct = (index: number) => {
  if (batchData.value.length > 1) {
    batchData.value.splice(index, 1)
  }
}

const isToday = computed(() => {
  const today = dayjs().format('DD-MM-YYYY')
  return available_date.value === today
})

const submit = async (
  type:
    | 'create_and_paid'
    | 'paid_approved'
    | 'create_approved'
    | undefined = undefined
) => {
  isSubmitting.value = true
  errors.value = {} as TBatchErrors
  try {
    let params = {
      internal_code: internal_code.value,
      provider_id: selectedProvider.value.id,
      stock_id: selectedStock.value?.id,
      available_date: available_date.value,
      batch_items: batchData.value.map((item) => {
        return {
          quantity: item.quantity ?? null,
          cost: item.cost.replace(',', '.'),
          stock_id: selectedStock.value?.id,
          ...(item.selected_product.isProduct && {
            lot_number: item.lot_number,
          }),
          ...(item.selected_product.isProduct && {
            product_id: item.selected_product.id,
          }),
          ...(item.selected_product.isProduct && {
            show_to_client: show_to_client.value.value,
          }),
          ...(item.selected_product.isProduct && {
            expiry_date: item.expiry_date ?? null,
          }),
          ...(item.selected_product.isRelatedProduct && {
            related_product_id: item.selected_product.id,
          }),
        }
      }),
    }
    if (type) {
      params[type] = 1
    }

    const data = await batchStore.actionCreateBatch(params)

    if (data.status == 201) {
      modalStore.setIsFormDirty(false)
      queryClient.invalidateQueries({
        queryKey: ['batch-history'],
      })
      queryClient.invalidateQueries({
        queryKey: ['providers'],
      })
      queryClient.invalidateQueries({
        queryKey: ['payments-buy'],
      })
      queryClient.invalidateQueries({
        queryKey: ['stocks'],
      })
      router.push({ path: '/admin/buy/status-batch' })
    } else {
      Object.keys(data.response.data.errors).forEach((item, index) => {
        if (index == 0) {
          errors.value[item] = data.response.data.errors[item][0]
            .replace(/batch_items\.\d+\.quantity/g, 'quantity')
            .replace(/batch_items\.\d+\.product_id/g, 'product')
            .replace(/batch_items\.\d+\.related_product_id/g, 'product')
            .replace(/items\.\d+\.related/g, 'items')
            .replace(/batch_items\.\d+\.expiry_date/g, 'expiry date')
            .replace(/batch_items\.\d+\.cost/g, 'cost')
        }
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

const selectProduct = ($event: any, index: number) => {
  batchData.value[index].cost = ''
  batchData.value[index].quantity = ''
  batchData.value[index].selected_product = $event
  if ($event.isRelatedProduct) {
    if (!$event.cost_price) return
    batchData.value[index].cost = formatCurrency($event.cost_price, true, true)
  } else {
    if (!$event.product_cost) return
    batchData.value[index].cost = formatCurrency(
      $event.product_cost,
      true,
      true
    )
  }
}

const validateProductSelection = (product, index) => {
  const isAlreadySelected = batchData.value.some(
    (item: any, idx: number) =>
      idx !== index && item.selected_product?.id === product.id
  )

  if (isAlreadySelected) {
    errors.value[`batch_items.${index}.product_id`] =
      'This product is already selected'
    setTimeout(() => {
      errors.value[`batch_items.${index}.product_id`] = ''
    }, 3000)
    return
  }

  return true
}

const calculatePallets = (
  value: number,
  packs_quantity_per_pallet: number
): number | string => {
  if (!value) {
    return ''
  }
  const val = Number(value) / Number(packs_quantity_per_pallet)
  return val > 0 && val < 1 ? 1 : Math.ceil(val)
}
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const beforeUnloadHandler = (event) => {
  navigator.sendBeacon(
    apiBaseUrl + 'batch_items/lot_number/delete',
    String(me.value.id)
  )
  event.preventDefault()
  event.returnValue = ''
}

const calculatePalletCost = (quantity: number, palletCost: number): string => {
  if (!quantity || !palletCost) {
    return ''
  }
  const totalCost = Number(quantity) * Number(palletCost)
  return formatCurrency(totalCost, true, true)
}

onMounted(async () => {
  window.addEventListener('beforeunload', beforeUnloadHandler)

  const date = new Date()
  available_date.value = formatDate(date)
  internal_code.value = await batchStore.actionGetInternalCode()
  batchData.value[0].lot_number = await batchStore.actionGetLotNumber()
  providersStore.$reset()
  productStore.$reset()
  relatedStore.$reset()
  selectedStock.value = stocks.value.filter(
    (item) => item.id == route.params.stock
  )?.[0]
  await providersStore.actionGetProviders({ per_page: 99999 })
  await productStore.actionGetProducts({
    per_page: 99999,
    include: ['productLimitsPerPack', 'relatedProducts'],
  })
  await relatedStore.actionGetRelatedProducts({ per_page: 99999 })
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)

  providersStore.$reset()
  productStore.$reset()
  relatedStore.$reset()
})
</script>

<template>
  <div class="new-batch flex justify-center">
    <div class="form-content w-full max-w-6xl">
      <h1 class="uppercase">{{ $t('New_Batch') }}</h1>
      <form class="gap-120 flex flex-col" @submit.prevent="submit()">
        <div class="content flex flex-col">
          <div class="main">
            <UIInput
              @update:model-value="errors = {} as TBatchErrors"
              @click="errors = {} as TBatchErrors"
              v-model="internal_code"
              :placeholder="`${$t('Internal_Code')} *`"
              :is-dirty="true"
            />
            <SingleSelect
              @click="errors = {} as TBatchErrors"
              :error="errors.provider_id"
              :placeholder="`${$t('Provider')} *`"
              :data="providers.data"
              :show-key="'company'"
              :none="false"
              :selected="selectedProvider"
              @select="selectedProvider = $event"
              :is-dirty="true"
            />
            <SingleSelect
              @click="errors = {} as TBatchErrors"
              :error="errors.stock_id"
              :placeholder="`${$t('Choose_a_stock')} *`"
              :data="stocks"
              :none="false"
              :selected="selectedStock"
              @select="selectedStock = $event"
              :is-dirty="true"
            />
            <UIInputDate
              @click="errors = {} as TBatchErrors"
              :error="errors.available_date"
              :placeholder="`${$t('Availability_date')} *`"
              v-model="available_date"
              :is-dirty="true"
            />
            <SingleSelect
              :placeholder="`${$t('Show_to_client')} *`"
              :data="SHOW_TO_CLIENT"
              :selected="show_to_client"
              @select="show_to_client = $event"
              :none="false"
              :selected-key="'value'"
              :is-dirty="true"
            />
          </div>
          <div class="products" v-for="(batchD, index) in batchData">
            <SearchSelect
              :showFromSelected="true"
              :placeholder="`${$t('Product')} *`"
              :error="errors[`batch_items.${index}.product_id`]"
              @click="errors = {} as TBatchErrors"
              :data="compProducts"
              :none="false"
              :selected="batchD.selected_product"
              @select="selectProduct($event, index)"
              :show-key="'name'"
              :is-dirty="true"
              :validate="(product) => validateProductSelection(product, index)"
            />
            <UIInput
              @update:model-value="errors = {} as TBatchErrors"
              v-model="batchD.quantity"
              @click="errors = {} as TBatchErrors"
              :error="errors[`batch_items.${index}.quantity`]"
              :placeholder="`${$t('Quantity')} *`"
              :is-dirty="true"
            />
            <UIInput
              @update:model-value="errors = {} as TBatchErrors"
              :placeholder="`${$t('Cost')} *`"
              symbol="€"
              :error="errors[`batch_items.${index}.cost`]"
              v-model="batchD.cost"
              :is-dirty="true"
            />
            <UIInput
              @update:model-value="errors = {} as TBatchErrors"
              v-if="batchD.selected_product.isProduct"
              :placeholder="`${$t('Lot_Number')} *`"
              v-model="batchD.lot_number"
              :is-dirty="true"
            />
            <UIInputDate
              @click="errors = {} as TBatchErrors"
              v-if="!batchD.selected_product?.isRelatedProduct"
              :error="errors[`batch_items.${index}.expiry_date`]"
              :placeholder="`${$t('Expire_Date')} *`"
              v-model="batchD.expiry_date"
              :is-dirty="true"
            />
            <div class="flex gap-2">
              <UIInput
                @update:model-value="errors = {} as TBatchErrors"
                symbol="€"
                :placeholder="`${$t('Total')}`"
                v-model="compTotal[index]"
                :disabled="true"
                :is-dirty="true"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeProduct(Number(index))"
              >
                <IconMinus />
              </Button>
            </div>
            <template
              class="flex flex-col gap-2.5"
              v-if="
                batchD.selected_product.isProduct &&
                batchD.selected_product?.related_products.length
              "
              v-for="rel in batchD.selected_product.relatedProducts.data"
            >
              <UIInput
                :model-value="rel.related_product.name"
                :disabled="true"
                @update:model-value="errors = {} as TBatchErrors"
                :placeholder="`${$t('Related_product')}`"
              />
              <UIInput
                :model-value="
                  rel.related_product.related_with === 1
                    ? calculatePallets(
                        Number(batchD.quantity),
                        batchD.selected_product.packs_quantity_per_pallet
                      )
                    : batchD.quantity
                "
                :disabled="true"
                @update:model-value="errors = {} as TBatchErrors"
                :placeholder="`${$t('Quantity')}`"
              />
              <UIInput
                :model-value="
                  calculatePalletCost(
                    rel.related_product.related_with === 1
                      ? parseNumber(
                          calculatePallets(
                            parseNumber(batchD.quantity),
                            batchD.selected_product.packs_quantity_per_pallet
                          )
                        )
                      : parseNumber(batchD.quantity),
                    parseNumber(rel.related_product.cost_price)
                  )
                "
                :disabled="true"
                @update:model-value="errors = {} as TBatchErrors"
                :placeholder="`${$t('Pallet_Cost')}`"
              />
              <div></div>
              <div></div>
              <div></div>
            </template>
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
        <div class="actions flex w-full justify-end gap-4">
          <Button class="capitalize" :disabled="isSubmitting">{{
            $t('create')
          }}</Button>
          <Button
            class="capitalize"
            type="button"
            variant="outline"
            @click="submit('create_and_paid')"
            :disabled="isSubmitting"
            >{{ $t('create') }} & {{ $t('paid') }}
          </Button>
          <Button
            v-if="isToday"
            class="capitalize"
            type="button"
            variant="outline"
            @click="submit('create_approved')"
            :disabled="isSubmitting"
            >{{ $t('create') }} & {{ $t('approved') }}
          </Button>
          <Button
            v-if="isToday"
            class="capitalize"
            type="button"
            variant="outline"
            @click="submit('paid_approved')"
            :disabled="isSubmitting"
            >{{ $t('create') }}, {{ $t('paid') }} & {{ $t('approved') }}
          </Button>
          <Button
            class="capitalize"
            type="button"
            variant="outline"
            @click="router.push({ path: '/admin/buy/status-batch' })"
            >{{ $t('Go_Back') }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.new-batch {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      .content {
        .main {
          display: grid;
          grid-template-columns: 141px 1fr 1fr 205px 121px;
          gap: 10px;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--gray-200);
        }

        .products {
          margin-bottom: 13px;
          display: grid;
          grid-template-columns: 1fr 141px 120px 146px 186px 150px;
          gap: 13px 10px;
        }
      }
    }
  }
}
</style>
