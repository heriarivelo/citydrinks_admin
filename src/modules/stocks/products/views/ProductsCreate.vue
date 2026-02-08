<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UIImageInput from '@/components/ui/inputs/UIImageInput.vue'
import CategorySelect from '@/components/ui/selects/CategorySelect.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import {
  TProduct,
  TProductErrors,
} from '@/modules/stocks/products/store/types/productTypes.ts'
import { TCategory } from '@/store/types/categoryTypes.ts'
import UIInputLimits from '@/components/ui/inputs/UIInputLimits.vue'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import IconAddColored from '@/components/icons/IconAddColored.vue'
import TariffSelect from '@/components/ui/selects/TariffSelect.vue'
import IconMinus from '@/components/icons/IconMinus.vue'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { storeToRefs } from 'pinia'
import { PACK_USAGE } from '@/modules/stocks/products/constants.ts'
import { parseEuroCurrency } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { Button } from '@/components/ui/button'
import IconPlus20 from '@/components/icons/IconPlus20.vue'

const productStore = useProductStore()
const relatedStore = useRelatedStore()
const { relatedProducts } = storeToRefs(relatedStore)
const router = useRouter()
const modalStore = useModalStore()
const productInit = {
  tariffs: [],
  related_products: [],
} as TProduct
const errors = ref({} as TProductErrors)
const selectedCategory = ref({} as TCategory)
const selectedTariffs = ref([])
const selectedRelatedProducts = ref([])
const selectedPack = ref({} as TPackUsage)
const productForm = ref(JSON.parse(JSON.stringify(productInit)))
const isSubmitting = ref(false)

type TPackUsage = {
  id: number
  name: string
  value: string
}

const setImage = (e) => {
  productForm.value.product_image = e
}

const addTariff = () => {
  productForm.value.tariffs.push({
    tariff_id: 0,
    price: '',
  })
}

const removeTariff = (index: number) => {
  productForm.value.tariffs.splice(index, 1)
}

const addRelatedProducts = () => {
  productForm.value.related_products.push({
    related_product_id: 0,
  })
}

const removeRelatedProducts = (index: number) => {
  productForm.value.related_products.splice(index, 1)
}

const compRelatedProducts = computed(() => {
  const selectedRelated = selectedRelatedProducts.value.map((item) => item.id)
  return relatedProducts.value.data
    .map((product) => {
      if (!selectedRelated.includes(product.id)) {
        return product
      }
    })
    .filter((product) => product)
})

const submit = async () => {
  isSubmitting.value = true

  errors.value = {} as TProductErrors
  const formData = new FormData()
  formData.append('product_image', productForm.value.product_image ?? '')
  formData.append('name', productForm.value.name ?? '')
  formData.append(
    'category_id',
    selectedCategory.value?.id ? selectedCategory.value?.id?.toString() : ''
  )
  formData.append('pack_usage', selectedPack.value.value ?? '')
  formData.append(
    'price_per_pack',
    parseEuroCurrency(productForm.value.price_per_pack).toString()
  )
  formData.append(
    'product_cost',
    parseEuroCurrency(productForm.value.product_cost).toString()
  )
  formData.append(
    'packs_quantity_per_pallet',
    productForm.value.packs_quantity_per_pallet ?? ''
  )

  if (selectedPack.value.value !== '0') {
    productForm.value.limits?.forEach((limit, index) => {
      formData.append(`limits[${index}]`, limit)
    })
  }
  selectedTariffs.value
    .map((item, index) => {
      return {
        tariff_id: item.id,
        price: parseEuroCurrency(productForm.value.tariffs?.[index].price),
      }
    })
    .forEach((tariff, index) => {
      formData.append(`tariffs[${index}][tariff_id]`, tariff.tariff_id)
      formData.append(`tariffs[${index}][price]`, tariff.price.toString())
    })
  selectedRelatedProducts.value
    .map((item) => ({ related_product_id: item.id }))
    .forEach((product, index) => {
      formData.append(
        `related_products[${index}][related_product_id]`,
        product.related_product_id
      )
    })
  const data = await productStore.actionCreateProduct(formData)
  if (data.status == 201) {
    productForm.value = JSON.parse(JSON.stringify(productInit))
    modalStore.setIsFormDirty(false)
    await router.push('/admin/stocks/products')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
  isSubmitting.value = false
}

onMounted(() => {
  relatedStore.actionGetRelatedProducts()
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
              @upload="setImage"
              :justPick="false"
              :error="errors.product_image"
            />
          </div>
          <div class="content gap-8">
            <div class="flex flex-col gap-4">
              <UIInput
                @click="errors = {} as TProductErrors"
                :error="errors.name"
                :placeholder="`${$t('Product')} *`"
                v-model="productForm.name"
                :is-dirty="true"
              />
              <CategorySelect
                :error="errors.category_id"
                @click="errors = {} as TProductErrors"
                :selected="selectedCategory"
                @select="selectedCategory = $event"
              />
              <SingleSelect
                @click="errors = {} as TProductErrors"
                :error="errors.pack_usage"
                :none="false"
                :data="PACK_USAGE"
                :placeholder="`${$t('Pack_Usage')} *`"
                :selected="selectedPack"
                @select="selectedPack = $event"
                :is-dirty="true"
              />
              <UIInput
                @click="errors = {} as TProductErrors"
                :error="errors.price_per_pack"
                :placeholder="`${$t('Price_per_Pack')} *`"
                symbol="€"
                v-model="productForm.price_per_pack"
                :is-dirty="true"
              />
              <UIInput
                @click="errors = {} as TProductErrors"
                :error="errors.product_cost"
                :placeholder="`${$t('Cost')} *`"
                symbol="€"
                v-model="productForm.product_cost"
                :is-dirty="true"
              />
              <UIInput
                @click="errors = {} as TProductErrors"
                :error="errors.packs_quantity_per_pallet"
                input-type="number"
                :placeholder="`${$t('Packs_quantity_per_pallet')} *`"
                v-model="productForm.packs_quantity_per_pallet"
                :is-dirty="true"
              />
              <UIInputLimits
                v-if="selectedPack.value !== '0'"
                @update:model-value="errors = {} as TProductErrors"
                :error="errors.limits"
                :placeholder="`${$t('Pack_Limits')} *`"
                v-model="productForm.limits"
              />
            </div>
            <div class="tariff-product flex flex-col">
              <div class="tariff-block">
                <div
                  class="tariff-section"
                  v-if="productForm.tariffs?.length"
                  v-for="(tariff, index) in productForm.tariffs"
                >
                  <TariffSelect
                    :selected="selectedTariffs[index]"
                    @click="errors = {} as TProductErrors"
                    @select="selectedTariffs[index] = $event"
                  />
                  <UIInput
                    @click="errors = {} as TProductErrors"
                    :placeholder="`${$t('Tariff_price')} *`"
                    v-model="tariff.price"
                    :symbol="'€'"
                    :is-dirty="true"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                    @click="removeTariff(index)"
                  >
                    <IconMinus />
                  </Button>
                </div>
              </div>
              <div class="product-block">
                <div
                  class="product-section"
                  v-if="productForm.related_products?.length"
                  v-for="(related, index) in productForm.related_products"
                >
                  <SingleSelect
                    @click="errors = {} as TProductErrors"
                    :data="compRelatedProducts"
                    :showFromSelected="true"
                    :placeholder="`${$t('Related_Products')}`"
                    :selected="selectedRelatedProducts[index]"
                    @select="selectedRelatedProducts[index] = $event"
                    :is-dirty="true"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                    @click="removeRelatedProducts(index)"
                  >
                    <IconMinus />
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                class="h-8 self-start px-2"
                @click="addTariff"
              >
                <IconPlus20 />
                <span class="body-text-2"> {{ $t('Add_Tariff') }}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                class="h-8 self-start px-2"
                @click="addRelatedProducts"
              >
                <IconAddColored type="success" />
                <span class="body-text-2"> {{ $t('Related_product') }}</span>
              </Button>
            </div>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton @click="submit" :disabled="isSubmitting">{{
            $t('Create')
          }}</UIButton>
          <UIButton type="button" types="cancel" @click="$router.go(-1)">
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
