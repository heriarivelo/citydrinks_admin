<script setup lang="ts">
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { getPhotoUrl } from '@/utils/routes.ts'
import { useBatchStore } from '@/modules/stocks/store/batch.ts'
import IconDrag from '@/components/icons/IconDrag.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { SHOW_TO_CLIENT } from '@/modules/stocks/constants.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { useModalStore } from '@/store/modal.ts'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { CircleAlert } from 'lucide-vue-next'
import {
  TooltipContent,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const route = useRoute()
const productStore = useProductStore()
const batchStore = useBatchStore()
const modalStore = useModalStore()
const { product } = storeToRefs(productStore)
const {
  batchList,
  waitingBatchList,
  batchListQuantity,
  waitingBatchListQuantity,
} = storeToRefs(batchStore)
const draggedIndex = ref(null)

const compQuantity = computed(() => {
  return batchList.value.reduce((acc, item) => {
    acc += item.quantity
    return acc
  }, 0)
})

const compReservedQuantity = computed(() => {
  return batchList.value.reduce((acc, item) => {
    acc += item.reserved_quantity
    return acc
  }, 0)
})

const onDragStart = (index: number) => {
  draggedIndex.value = index
}
const onDrop = async (index: number) => {
  if (draggedIndex.value !== null) {
    const draggedItem = batchList.value[draggedIndex.value]
    batchList.value.splice(draggedIndex.value, 1)
    batchList.value.splice(index, 0, draggedItem)
    const draggedQuantityItem = batchListQuantity.value[draggedIndex.value]
    batchListQuantity.value.splice(draggedIndex.value, 1)
    batchListQuantity.value.splice(index, 0, draggedQuantityItem)
    let params = {
      orders: batchList.value.map((batchList, index) => {
        return {
          batch_item_id: batchList.id,
          order: index + 1,
        }
      }),
    }
    await batchStore.actionGetBatchListOrderUpdate(params, product.value.id)
    draggedIndex.value = null
  }
}

const deleteBatch = async (id) => {
  await batchStore.actionDeleteBatch(id)
  await batchStore.actionGetBatchListByStockAndProduct({
    stock_id: route.params.stock,
    product_id: route.params.product_id,
  })
}

const updateShow = async (show: any, id: number) => {
  await batchStore.actionUpdateShowToClient(id, show.value)
  await batchStore.actionGetBatchListByStockAndProduct({
    stock_id: route.params.stock,
    product_id: route.params.product_id,
  })
}

onMounted(async () => {
  productStore.$reset()
  await productStore.actionGetProductById(Number(route.params.product_id))
  await batchStore.actionGetBatchListByStockAndProduct({
    stock_id: route.params.stock,
    product_id: route.params.product_id,
  })
})

onUnmounted(() => {
  productStore.$reset()
})
</script>

<template>
  <div class="edit-a-product flex flex-col items-center gap-6">
    <h1 class="w-full text-center uppercase">{{ $t('Edit_Product') }}</h1>
    <div class="edit-a-product-content flex gap-6">
      <div class="img">
        <img :src="getPhotoUrl(product.product_image)" alt="product_photo" />
      </div>
      <div class="product-info">
        <div class="available-product gap-19 flex flex-col">
          <h2>{{ $t('Available_product') }}</h2>
          <div class="product-drag-content flex flex-col gap-4">
            <div class="drag-info flex flex-col gap-2">
              <div class="flex justify-between">
                <div>
                  <span class="body-text gray">{{ $t('Product') }}</span
                  >:
                  <span class="body-text">{{ product.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div>
                          <CircleAlert
                            :size="18"
                            :class="
                              cn(
                                'text-[var(--status)]',
                                batchList &&
                                  !batchList[0]?.reserved_quantity &&
                                  'select-none opacity-0'
                              )
                            "
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {{ compReservedQuantity }}
                          {{ $t('pack') }}
                          {{ $t('reserved') }}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span class="body-text gray">{{ $t('QNT') }}</span
                  >:
                  <span class="body-text">{{ compQuantity }}</span>
                </div>
              </div>
            </div>
            <div class="drag-content flex flex-col gap-4">
              <div
                class="drag-item"
                v-for="(batch, index) in batchList"
                :key="batch.id"
              >
                <UIInput
                  v-model="batchListQuantity[index]"
                  :disabled="true"
                  :placeholder="`${$t('QNT__(Pack)')}`"
                />
                <UIInputDate
                  :disabled="true"
                  :placeholder="`${$t('Expire_Date')}`"
                  v-model="batch.expiry_date"
                />
                <UIInputDate
                  :disabled="true"
                  :placeholder="`${$t('Availability_date')}`"
                  v-model="batch.available_date"
                />
                <UIInput
                  :disabled="true"
                  :placeholder="`${$t('Lot_Number')}`"
                  v-model="batch.lot_number"
                />
                <SingleSelect
                  :placeholder="`${$t('Show_to_client')}`"
                  :data="SHOW_TO_CLIENT"
                  @select="updateShow($event, batch.id)"
                  :selected="{ value: batch.show_to_client }"
                  :none="false"
                  :selected-key="'value'"
                />
                <Button
                  variant="outline"
                  size="iconLg"
                  class="size-[42px] border-indigo-100 text-[var(--neutral-400)]"
                  @click="
                    modalStore.setModal({
                      open: true,
                      target: 'editProductReason',
                      data: {
                        id: batch.id,
                        expiry_date: batch.expiry_date,
                        available_date: batch.available_date,
                        quantity: batch.quantity,
                        packs_quantity_per_pallet:
                          batch.product.packs_quantity_per_pallet,
                      },
                    })
                  "
                >
                  <Pencil />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div class="waiting-products flex flex-col gap-4">
          <h2>{{ $t('Waiting_product') }}</h2>
          <div class="waiting-products-content flex flex-col gap-4">
            <div
              class="waiting-product-item"
              v-for="(batch, index) in waitingBatchList"
              :key="batch.id"
            >
              <UIInputDate
                :disabled="true"
                :placeholder="`${$t('Expire_Date')}`"
                v-model="batch.expiry_date"
              />
              <UIInput
                v-model="waitingBatchListQuantity[index]"
                :disabled="true"
                :placeholder="`${$t('QNT__(Pack)')}`"
              />
              <UIInputDate
                :disabled="true"
                :placeholder="`${$t('Availability_date')}`"
                v-model="batch.available_date"
              />
              <UIInput
                :disabled="true"
                :placeholder="`${$t('Lot_Number')}`"
                v-model="batch.lot_number"
              />
              <SingleSelect
                :placeholder="`${$t('Show_to_client')}`"
                :data="SHOW_TO_CLIENT"
                :disabled="true"
                :selected="{ value: batch.show_to_client }"
                :none="false"
                :selected-key="'value'"
              />
              <Button
                variant="outline"
                size="iconLg"
                class="size-[42px] border-indigo-100 text-[var(--neutral-400)]"
                @click="
                  modalStore.setModal({
                    open: true,
                    target: 'editProductReason',
                    data: {
                      id: batch.id,
                      expiry_date: batch.expiry_date,
                      available_date: batch.available_date,
                      quantity: batch.quantity,
                      packs_quantity_per_pallet:
                        batch.product.packs_quantity_per_pallet,
                    },
                  })
                "
              >
                <Pencil />
              </Button>
              <Button
                variant="outline"
                size="iconLg"
                class="size-[42px] border-indigo-100 text-destructive"
                @click="deleteBatch(batch.id)"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton type="button" types="cancel" @click="$router.go(-1)"
            >{{ $t('Go_Back') }}
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-a-product {
  padding: 32px 41px;

  .edit-a-product-content {
    .img {
      max-width: 259px;
      max-height: 270px;
      width: 100%;

      img {
        max-width: 259px;
        max-height: 270px;
        object-fit: cover;
      }
    }

    .product-info {
      min-width: 770px;

      h2 {
        color: var(--gray-300);
        position: relative;
        width: max-content;

        &:after {
          content: '';
          display: block;
          width: 292px;
          height: 1px;
          background-color: var(--neutral-300);
          position: absolute;
          left: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .available-product {
        .product-drag-content {
          .drag-info {
            padding-bottom: 16px;
            border-bottom: 1px solid var(--gray-200);

            .gray {
              color: var(--gray-200);
            }
          }

          .drag-content {
            .drag-item {
              display: grid;
              gap: 8px;
              grid-template-columns: 144px 144px 144px 117px 1fr 44px;
              align-items: center;

              &[draggable='true'] {
                cursor: move;
              }

              .edit {
                padding: 7px 9px;
                border: 1px solid var(--neutral-200);
                font-size: 0;
                border-radius: 4px;
                cursor: pointer;
              }
            }
          }
        }
      }

      .waiting-products {
        margin-top: 40px;

        .waiting-products-content {
          .waiting-product-item {
            display: grid;
            gap: 8px;
            grid-template-columns: 134.7px 134.7px 134.7px 117px 113px 44px 44px;
            align-items: center;

            &[draggable='true'] {
              cursor: move;
            }

            .edit {
              padding: 7px 9px;
              border: 1px solid var(--neutral-200);
              font-size: 0;
              border-radius: 4px;
              cursor: pointer;
            }
          }
        }
      }

      .actions {
        margin-top: 50px;
      }
    }
  }
}
</style>
