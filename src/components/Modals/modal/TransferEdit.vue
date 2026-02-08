<script setup lang="ts">
import { TBatchTransferErrors } from '@/modules/stocks/store/types/batchTypes.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { getCurrentDate } from '@/utils/dateUtils'
import { TModal } from '@/store/types/modalTypes.ts'
import UIButton from '@/components/ui/UIButton.vue'
import { TStock } from '@/modules/stocks/store/types/stockTypes.ts'
import { Button } from '@/components/ui/button'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import IconMinus from '@/components/icons/IconMinus.vue'
import CheckboxInput from '@/components/ui/inputs/CheckboxInput.vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchTransfer } from '@/api/transfer'
import { TProduct } from '@/modules/stocks/products/store/types/productTypes'
import { cn, parseNumber } from '@/lib/utils'
import { TRelatedProduct } from '@/modules/others/relatedProduct/store/types/relatedTypes'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { TriangleAlert } from 'lucide-vue-next'
import axiosClient from '@/utils/axiosClient'
import { useNotificationStore } from '@/store/notification'

const notificationStore = useNotificationStore()
const modalStore = useModalStore()
const stockStore = useStockStore()
const productStore = useProductStore()
const { modal } = storeToRefs(modalStore)
const { stocks } = storeToRefs(stockStore)
const { products } = storeToRefs(productStore)
const errors = ref({} as TBatchTransferErrors)
const focus = ref([] as Boolean[])
const stockFrom = ref({} as TStock)
const stockTo = ref({} as TStock)
const approved = ref(false)
const isInitialApproved = ref(false)
const isInitialReadyForTransfer = ref(false)
const readyForTransfer = ref(false)
const deletedItems = ref<{ id: number }[]>([])
const selectedRemoveProductIndex = ref<number>(null)
const isCreateAutoTransferDialogOpen = ref(false)
const isSaved = ref(false)
const dataLoaded = ref(false)
const queryClient = useQueryClient()

const selectedProducts = ref<
  {
    quantity: string
    selected_product: TProduct & { batchItems?: { data: any } }
    lot_number: any
    is_new: boolean
    history_ids?: number[]
  }[]
>([])
const id = computed<number>(() => modal.value.data.id)
const { data: transfer, isLoading } = useQuery({
  queryKey: ['transfer', id],
  queryFn: () => fetchTransfer(id),
})

const addProduct = () => {
  modalStore.setIsFormDirty(true)
  modalStore.isFormDialog = true
  selectedProducts.value.push({
    quantity: '',
    selected_product: {} as any,
    lot_number: {} as any,
    is_new: true,
  })
}

const removeProduct = (index: number, isNew: boolean) => {
  modalStore.setIsFormDirty(true)
  modalStore.isFormDialog = true
  if (!isNew) {
    const historyIds = selectedProducts.value[index].history_ids || []
    deletedItems.value.push(...historyIds.map((id) => ({ id })))
  }
  selectedProducts.value.splice(index || selectedRemoveProductIndex.value, 1)
  selectedRemoveProductIndex.value = null
}

const handleRemoveProduct = (index: number, isNew: boolean) => {
  if (modal.value.data.is_auto_transfer && !isNew) {
    selectedRemoveProductIndex.value = index
  } else {
    removeProduct(index, isNew)
  }
}

const compRelatedProductsQuantityForTheSameProducts = () => {
  const newRelatedProducts = [] as {
    product_id: number
    relatedProducts: {
      related_product: TRelatedProduct
      quantity: number
      packsQuantityPerPallet: number
      type: number
    }[]
  }[]

  selectedProducts.value.forEach((item) => {
    if (!item.lot_number.product?.related_products?.length) return

    const product_id = item.lot_number.product.id

    const itemTotalQuantity = parseNumber(item.quantity)

    let productGroup = newRelatedProducts.find(
      (p) => p.product_id == product_id
    )

    if (!productGroup) {
      productGroup = {
        product_id,
        relatedProducts: [],
      }
      newRelatedProducts.push(productGroup)
    }

    item.lot_number.product.related_products.forEach((rel) => {
      const existingRelated = productGroup.relatedProducts.find(
        (existing) =>
          existing.related_product.id === rel.related_product.id &&
          existing.type === rel.related_product.related_with
      )

      if (existingRelated) {
        existingRelated.quantity += itemTotalQuantity
      } else {
        productGroup.relatedProducts.push({
          related_product: rel.related_product,
          quantity: itemTotalQuantity,
          packsQuantityPerPallet:
            item.lot_number.product.packs_quantity_per_pallet,
          type: rel.related_product.related_with,
        })
      }
    })
  })
  return {
    newRelatedProducts,
  }
}

const onQuantityChange = (value: string, index: number) => {
  const availableQuantity =
    selectedProducts.value[index].lot_number?.available_quantity || 0

  errors.value = {} as TBatchTransferErrors

  const numericValue = Number(value)

  if (!value || isNaN(numericValue) || numericValue < 0) {
    selectedProducts.value[index].quantity = ''
    errors.value[`quantity_${index}`] = ''
    return
  }

  if (numericValue > availableQuantity) {
    selectedProducts.value[index].quantity = String(availableQuantity)
    errors.value[`quantity_${index}`] = `Max quantity is ${availableQuantity}`
    modalStore.setIsFormDirty(true)
    modalStore.isFormDialog = true
  } else {
    selectedProducts.value[index].quantity = value
    modalStore.setIsFormDirty(true)
    modalStore.isFormDialog = true
  }
}

const transferMutation = useMutation({
  mutationFn: (params: any) =>
    axiosClient.post(`/admin/transfer-edit/${modal.value.data.id}`, params),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transfer-status'] })
    queryClient.invalidateQueries({
      queryKey: ['transfer', id.value],
    })
    queryClient.invalidateQueries({
      queryKey: ['stocks'],
    })
    modalStore.setModal({} as TModal)
    modalStore.setIsFormDirty(false)
  },
})

const submit = async (create_transfer_for_deleted_products: 0 | 1) => {
  if (deletedItems.value.length > 0 && !isSaved.value) {
    isCreateAutoTransferDialogOpen.value = true
    isSaved.value = true
    return
  }

  const params = {
    from_stock_id: stockFrom.value.id,
    to_stock_id: stockTo.value.id,
    deleted_items: deletedItems.value,
    approved: approved.value ? 1 : 0,
    ready_for_transfer: readyForTransfer.value ? 1 : 0,
    items: selectedProducts.value
      .map((product) => ({
        id: product.selected_product.id,
        quantity: product.quantity,
        lot_number: product.lot_number?.lot_number,
      }))
      .filter((item) => item.quantity != '0'),
    create_transfer_for_deleted_products,
  }

  transferMutation.mutate(params)

  // const data = await batchStore.updateTransferProducts(
  //   params,
  //   modal.value.data.id
  // )
  // if (!data.response?.data?.status) {
  //   await batchStore.actionGetBatchTransferList({
  //     include: [
  //       'product',
  //       'senderStock',
  //       'receiverStock',
  //       'senderStockBatchItem',
  //     ],
  //   })
  //   modalStore.setModal({} as TModal)
  // } else {
  //   if (!data.response?.data?.errors) {
  //     errors.value['quantity'] = data.response?.data?.error
  //     return
  //   }
  //   Object.keys(data.response.data.errors).forEach((item, index) => {
  //     if (index == 0) {
  //       errors.value[item] = data.response.data.errors[item][0]
  //         .replace('lot_number', 'lot number')
  //         .replace('id', 'lot number')
  //         .replace('quantity', 'quantity')
  //         .replace('receiver_stock_id', 'receiver stock')
  //         .replace('sender_stock_id', 'sender stock')
  //     }
  //   })
  // }
}

const selectProduct = ($event, index) => {
  selectedProducts.value[index].selected_product = $event
  selectedProducts.value[index].lot_number = {}
  selectedProducts.value[index].quantity = ''
}

const compStocks = computed(() => {
  return stocks.value.filter(
    (item) => item?.id !== stockFrom.value?.id && item?.id !== stockTo.value?.id
  )
})

const compQuantity = computed(() => {
  return selectedProducts.value?.map((item: any) => {
    return item.quantity
      ? `${Math.trunc(item.quantity / item.selected_product?.packs_quantity_per_pallet) + ' PL ' + (item.quantity % item.selected_product?.packs_quantity_per_pallet) + ' PK'}`
      : ''
  })
})

const loadTransferData = async () => {
  if (!dataLoaded.value && !isLoading.value) {
    productStore.$reset()
    await productStore.actionGetProducts({
      per_page: 999,
      'batchItems:available_date': `[lte]${getCurrentDate()}`,
      include: [`batchItems:criteria(stock_id=${16})`],
    })

    stockFrom.value = stocks.value.filter((item) => {
      return item.name == modal.value.data.sender
    })?.[0]
    stockTo.value = stocks.value.filter((item) => {
      return item.name == modal.value.data.receiver
    })?.[0]
    transfer.value.forEach((transferItem) => {
      selectedProducts.value.push({
        selected_product: transferItem.product,
        lot_number: transferItem,
        quantity: transferItem.quantity.toString(),
        history_ids: transferItem.history_ids,
        is_new: false,
      })
    })
    if (modal.value.data.status === 'approved') {
      approved.value = true
      isInitialApproved.value = true
    }
    if (modal.value.data.ready_for_transfer) {
      readyForTransfer.value = true
      isInitialReadyForTransfer.value = true
    }

    dataLoaded.value = true
  }
}

onMounted(async () => {
  await loadTransferData()
})

watch(
  () => ({ isOpen: modal.value.open, isLoading: isLoading.value }),
  async ({ isOpen, isLoading }) => {
    if (isOpen && !isLoading) {
      await loadTransferData()
    } else {
      productStore.$reset()
      dataLoaded.value = false
      stockFrom.value = null
      stockTo.value = null
      selectedProducts.value = []
    }
  }
)

onUnmounted(() => {
  productStore.$reset()
  dataLoaded.value = false
  stockFrom.value = null
  stockTo.value = null
  selectedProducts.value = []
})
</script>

<template>
  <div class="edit-transfer flex w-[1000px] flex-col gap-6">
    <AlertDialog :open="isCreateAutoTransferDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{
            $t('Crate_transfer_for_deleted_products')
          }}</AlertDialogTitle>
          <AlertDialogDescription
            class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
          >
            <TriangleAlert
              class="mt-1 shrink-0 text-secondary"
              stroke-width="2.5"
            />
            <span class="text-justify">
              You have deleted products. Do you want to create a new transfer
              for these products?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button class="w-[6.375rem]" @click="() => submit(1)">Yes</Button>
          <AlertDialogCancel class="w-[6.375rem]" @click="() => submit(0)"
            >No</AlertDialogCancel
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <h1 class="uppercase">
      {{
        modal.data.is_view
          ? $t('View_transfer_product')
          : $t('Edit_transfer_product')
      }}
    </h1>
    <div>
      <div class="flex flex-col">
        <div class="stocks-select flex gap-4">
          <SingleSelect
            @click="errors = {} as TBatchTransferErrors"
            class="w-full"
            :showFromSelected="true"
            :placeholder="`${$t('From_Name_stock')} *`"
            :data="compStocks"
            :show-key="'name'"
            :selected="stockFrom"
            @select="stockFrom = $event"
            :error="errors.sender_stock_id"
            :disabled="modal.data.is_view"
            :is-dirty="true"
            :is-form-dialog="true"
          />
          <SingleSelect
            @click="errors = {} as TBatchTransferErrors"
            class="w-full"
            :showFromSelected="true"
            :placeholder="`${$t('To_Name_stock')} *`"
            :data="compStocks"
            :show-key="'name'"
            :selected="stockTo"
            @select="stockTo = $event"
            :error="errors.receiver_stock_id"
            :disabled="modal.data.is_view"
            :is-dirty="true"
            :is-form-dialog="true"
          />
        </div>
        <div
          class="custom-scrollbar flex max-h-[50vh] min-h-48 flex-col gap-4 overflow-y-auto py-2 pt-4"
        >
          <div
            class="add-products"
            :style="{
              gridTemplateColumns: `1fr 140px 140px 183px ${modal.data.is_view ? '0' : '32px'}`,
            }"
            v-for="(product, index) in selectedProducts"
          >
            <SearchSelect
              :showFromSelected="true"
              :placeholder="`${$t('Product')} *`"
              @click="errors = {} as TBatchTransferErrors"
              :data="products?.data"
              :none="false"
              :disabled="modal.data.is_view"
              :selected="product.selected_product"
              @select="selectProduct($event, index)"
              :show-key="'name'"
              :is-dirty="true"
              :is-form-dialog="true"
            />
            <UIInput
              @update:model-value="onQuantityChange($event, index)"
              @click="errors = {} as TBatchTransferErrors"
              :error="errors[`quantity`] || errors[`quantity_${index}`]"
              :input-type="focus[index] ? 'number' : 'text'"
              :disabled="!product.selected_product?.id || modal.data.is_view"
              :model-value="
                !focus[index] ? compQuantity?.[index] : product.quantity
              "
              @update:focus="focus[index] = $event"
              :placeholder="`${$t('QNT__(Pack)')}`"
              :is-dirty="true"
              :is-form-dialog="true"
              :error-position="index === 0 ? 'bottom' : 'top'"
            />
            <SingleSelect
              :showFromSelected="true"
              :placeholder="`${$t('Lot_Number')} *`"
              :error="errors[`lot_number`] || errors[`id`]"
              @click="errors = {} as TBatchTransferErrors"
              :data="
                product.selected_product?.batchItems?.data.filter(
                  (lot) =>
                    !selectedProducts.some((p) => p.lot_number?.id === lot.id)
                )
              "
              :disabled="modal.data.is_view"
              :none="false"
              :selected="product.lot_number"
              @select="product.lot_number = $event"
              :show-key="'lot_number'"
              :is-dirty="true"
              :is-form-dialog="true"
            />
            <UIInputDate
              :disabled="true"
              :placeholder="`${$t('Expire_Date')} *`"
              v-model="product.lot_number.expiry_date"
              :is-dirty="true"
              :is-form-dialog="true"
            />
            <AlertDialog :open="selectedRemoveProductIndex === index">
              <AlertDialogTrigger as-child>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  class="h-[42px] w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                  @click="handleRemoveProduct(index, product.is_new)"
                  v-if="!modal.data.is_view"
                  :disabled="selectedProducts.length === 1"
                >
                  <IconMinus />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{{
                    $t('Remove_product')
                  }}</AlertDialogTitle>
                  <AlertDialogDescription
                    class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
                  >
                    <TriangleAlert
                      class="mt-1 shrink-0 text-secondary"
                      stroke-width="2.5"
                    />
                    <span class="text-justify">
                      Removing this product will remove product from order. Are
                      you sure you want to remove this product?
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    type="button"
                    class="w-[6.375rem]"
                    @click="removeProduct(index, product.is_new)"
                    >Remove</Button
                  >
                  <AlertDialogCancel
                    class="w-[6.375rem]"
                    @click="selectedRemoveProductIndex = null"
                    >Cancel</AlertDialogCancel
                  >
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div
              class="col-span-2 grid grid-cols-[1fr_140px] gap-4 pb-1"
              v-if="
                compRelatedProductsQuantityForTheSameProducts().newRelatedProducts.find(
                  (p) =>
                    p.product_id === product.selected_product.id &&
                    selectedProducts
                      .filter(
                        (item) =>
                          item.selected_product.id ===
                          product.selected_product.id
                      )
                      .indexOf(product) ===
                      selectedProducts.filter(
                        (item) =>
                          item.selected_product.id ===
                          product.selected_product.id
                      ).length -
                        1
                )?.relatedProducts.length
              "
            >
              <template
                v-for="rel in compRelatedProductsQuantityForTheSameProducts().newRelatedProducts.find(
                  (p) => p.product_id === product.selected_product.id
                )?.relatedProducts"
              >
                <UIInput
                  :model-value="rel.related_product?.name"
                  :disabled="true"
                  :placeholder="`${$t('Related_product')}`"
                  :is-dirty="true"
                  :is-form-dialog="true"
                />
                <UIInput
                  :model-value="
                    rel.type === 1
                      ? Math.ceil(rel.quantity / rel.packsQuantityPerPallet)
                      : rel.quantity
                  "
                  :disabled="true"
                  :placeholder="`${$t('Quantity')}`"
                  :is-dirty="true"
                  :is-form-dialog="true"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          class="mt-8 h-8 self-start px-2"
          @click="addProduct"
          v-if="!modal.data.is_view"
        >
          <IconPlus20 />
          <span class="body-text-2"> {{ $t('Add_product') }}</span>
        </Button>
        <div :class="cn('flex gap-4 ps-2 pt-2', modal.data.is_view && 'pt-8')">
          <CheckboxInput
            v-if="!modal.data.is_view"
            :modelValue="approved"
            @update:modelValue="
              (value) => {
                approved = value
                modalStore.setIsFormDirty(true)
                modalStore.isFormDialog = true
                readyForTransfer = value
              }
            "
            :disabled="isInitialApproved"
            >{{ $t('Approved') }}</CheckboxInput
          >
          <CheckboxInput
            v-if="!modal.data.is_view"
            :modelValue="readyForTransfer"
            @update:modelValue="
              (value) => {
                readyForTransfer = value
                modalStore.setIsFormDirty(true)
                modalStore.isFormDialog = true
              }
            "
            :disabled="isInitialReadyForTransfer"
            >{{ $t('Ready_for_transfer') }}</CheckboxInput
          >
        </div>
      </div>
    </div>
    <div class="flex w-full justify-end gap-4">
      <UIButton
        v-if="!modal.data.is_view"
        class="w-[6.375rem]"
        @click="() => submit(0)"
        :disabled="transferMutation.isPending.value"
        >{{ $t('Save') }}</UIButton
      >
      <UIButton
        type="button"
        types="cancel"
        class="w-[6.375rem]"
        @click="
          modalStore.isFormDirty
            ? modalStore.setIsDialogOpen(true)
            : modalStore.setModal({} as TModal)
        "
        :disabled="transferMutation.isPending.value"
        >{{ $t('Cancel') }}
      </UIButton>
    </div>
  </div>
</template>

<style scoped>
.edit-transfer {
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
  }
}
</style>
