<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import UIImageInput from '@/components/ui/inputs/UIImageInput.vue'
import CategorySelect from '@/components/ui/selects/CategorySelect.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { TProductErrors } from '@/modules/stocks/products/store/types/productTypes.ts'
import { TCategory } from '@/store/types/categoryTypes.ts'
import UIInputLimits from '@/components/ui/inputs/UIInputLimits.vue'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import IconAddColored from '@/components/icons/IconAddColored.vue'
import TariffSelect from '@/components/ui/selects/TariffSelect.vue'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { storeToRefs } from 'pinia'
import { PACK_USAGE } from '@/modules/stocks/products/constants.ts'
import { getPhotoUrl } from '@/utils/routes.ts'

const productStore = useProductStore()
const relatedStore = useRelatedStore()
const { relatedProducts } = storeToRefs(relatedStore)
const { product } = storeToRefs(productStore)
const route = useRoute()
const errors = ref({} as TProductErrors)
const selectedCategory = ref({} as TCategory)
const selectedTariffs = ref([])
const selectedLimits = ref([])
const selectedRelatedProducts = ref([])
const selectedPack = ref({} as TPackUsage)

type TPackUsage = {
  id: number
  name: string
  value: string
}

onMounted(async () => {
  await relatedStore.actionGetRelatedProducts()
  await productStore.actionGetProductById(Number(route.params.id))
  selectedCategory.value = product.value.category.data
  selectedPack.value = PACK_USAGE.filter(
    (item) => Number(item.value) == Number(product.value.pack_usage)
  )?.[0]
  selectedLimits.value = product.value.productLimitsPerPack.data.map(
    (item) => item.limit
  )
  selectedTariffs.value = product.value.productTariffs.data.map(
    (item) => item.tariff
  )
  selectedRelatedProducts.value = product.value.relatedProducts.data.map(
    (item) => item.related_product
  )
})

onUnmounted(() => {
  productStore.$reset()
})
</script>

<template>
  <div class="provider-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_Product') }}</h1>
      <div class="form flex flex-col gap-[50px]">
        <div class="flex gap-[30px]">
          <div class="upload-container">
            <UIImageInput
              :justPick="true"
              :dataImage="getPhotoUrl(product.product_image)"
            />
          </div>
          <div class="content gap-8">
            <div class="flex flex-col gap-4">
              <UIInput
                :disabled="true"
                :placeholder="`${$t('Product')} *`"
                v-model="product.name"
              />
              <CategorySelect :disabled="true" :selected="selectedCategory" />
              <SingleSelect
                :disabled="true"
                :data="PACK_USAGE"
                :placeholder="`${$t('Pack_Usage')} *`"
                :selected="selectedPack"
                @select="selectedPack = $event"
              />
              <UIInput
                :disabled="true"
                :placeholder="`${$t('Price_per_Pack')} *`"
                :model-value="Number(product.price_per_pack)"
              />
              <UIInput
                :input-type="'number'"
                :disabled="true"
                :placeholder="`${$t('Packs_quantity_per_pallet')} *`"
                :model-value="product.packs_quantity_per_pallet"
              />
              <UIInputLimits
                :disabled="true"
                :placeholder="`${$t('Pack_Limits')} *`"
                v-model="selectedLimits"
              />
            </div>
            <div class="tariff-product flex flex-col">
              <div class="tariff-block">
                <button
                  v-if="!product.productTariffs?.data?.length"
                  class="tariff-button body-text-2 flex cursor-pointer items-center gap-2"
                >
                  <IconAddColored />
                  {{ $t('Add_Tariff') }}
                </button>
                <div
                  class="tariff-section"
                  v-if="product.productTariffs?.data?.length"
                  v-for="(tariff, index) in product.productTariffs?.data"
                >
                  <TariffSelect
                    :disabled="true"
                    :selected="selectedTariffs[index]"
                    @select="selectedTariffs[index] = $event"
                  />
                  <UIInput
                    input-type="number"
                    :placeholder="`${$t('Tariff_price')} *`"
                    :model-value="Number(tariff.price)"
                  />
                </div>
              </div>
              <div class="product-block">
                <button
                  class="product-button body-text-2 flex cursor-pointer items-center gap-2"
                  v-if="!product.relatedProducts?.data?.length"
                >
                  <IconAddColored type="success" />
                  {{ $t('Related_product') }}
                </button>
                <div
                  class="product-section"
                  v-if="product.relatedProducts?.data?.length"
                  v-for="(related, index) in product.relatedProducts?.data"
                >
                  <SingleSelect
                    @click="errors = {} as TProductErrors"
                    :error="errors.pack_usage"
                    :data="relatedProducts.data"
                    :placeholder="`${$t('Related_Products')} *`"
                    :selected="selectedRelatedProducts[index]"
                    @select="selectedRelatedProducts[index] = $event"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/stocks/products')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.provider-create {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    .form {
      .content {
        display: grid;
        grid-template-columns: 318px 367px;
        width: 100%;
        margin: auto;
      }
    }

    .tariff-product {
      .tariff-button {
        background: none;
        border: none;
        color: var(--primary-500);
        padding: 0;
        margin-bottom: 16px;
      }

      .product-button {
        background: none;
        border: none;
        color: var(--success-500);
        padding: 0;
      }

      .tariff-section {
        display: grid;
        grid-template-columns: 155px 155px 24px;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .product-section {
        display: grid;
        grid-template-columns: 326px 24px;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .absolute-left {
        position: absolute;
        left: -26px;
        top: 10px;
      }

      .absolute-right {
        position: absolute;
        right: -26px;
        top: 10px;
      }

      .tariff-block,
      .product-block {
        position: relative;
      }
    }
  }
}
</style>
