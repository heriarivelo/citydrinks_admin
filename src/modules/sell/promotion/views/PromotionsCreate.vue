<script setup lang="ts">
import IconMinus from '@/components/icons/IconMinus.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { Button } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import SearchSelect from '@/components/ui/selects/SearchSelect.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { PROMOTION_TYPES } from '@/modules/sell/promotion/constants.ts'
import { usePromotionStore } from '@/modules/sell/promotion/store/promotion.ts'
import {
  TPromotion,
  TPromotionError,
} from '@/modules/sell/promotion/store/types/promotionTypes.ts'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { useModalStore } from '@/store/modal'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const promotionStore = usePromotionStore()
const productStore = useProductStore()
const router = useRouter()
const { products } = storeToRefs(productStore)
const modalStore = useModalStore()

// Local currency parser for this page only. Accepts both comma and dot decimals.
const parseCurrencyFlexible = (
  value: string | number | null | undefined
): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const sanitizedValue = value.replace(/[^0-9,.-]+/g, '')
  if (sanitizedValue.includes(',')) {
    const parts = sanitizedValue.split(',')
    if (parts.length > 2) return 0
    const integerPart = parts[0].replace(/\./g, '')
    const decimalPart = parts[1] ?? ''
    const normalized = decimalPart ? `${integerPart}.${decimalPart}` : integerPart
    const num = parseFloat(normalized)
    return isNaN(num) ? 0 : num
  }
  const dotCount = (sanitizedValue.match(/\./g) || []).length
  const normalized = dotCount > 1 ? sanitizedValue.replace(/\./g, '') : sanitizedValue
  const num = parseFloat(normalized)
  return isNaN(num) ? 0 : num
}

// Local percent parser for this page only. Accepts both comma and dot decimals.
const parsePercentFlexible = (
  value: string | number | null | undefined
): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const sanitizedValue = value.replace(/[^0-9,.-]+/g, '')
  const normalized = sanitizedValue.includes(',')
    ? sanitizedValue.replace(/\./g, '').replace(',', '.')
    : sanitizedValue
  const num = parseFloat(normalized)
  return isNaN(num) ? 0 : num
}

const errors = ref({} as TPromotionError)
const selectedProduct = ref<any>([])
const selectedTypes = ref<any>([])
const promotionForm = ref({
  name: '',
  start_date: '',
  end_date: '',
  products: [
    {
      product_id: '',
      type: '',
      amount: '',
    },
  ],
} as TPromotion)

const isInArray = (obj: any, array: any) => {
  return array.some((item: any) => item.id === obj.id)
}

const compProduct = computed(() => {
  return (
    products.value?.data?.filter(
      (item) => !isInArray(item, selectedProduct.value)
    ) ?? []
  )
})

const addProduct = () => {
  errors.value = {} as TPromotionError
  promotionForm.value.products.push({
    product_id: '',
    type: '',
    amount: '',
  })
}

const removeProduct = (index: number) => {
  if (promotionForm.value.products.length > 1) {
    errors.value = {} as TPromotionError
    promotionForm.value.products.splice(index, 1)
    selectedProduct.value.splice(index, 1)
    selectedTypes.value.splice(index, 1)
  }
}

const submit = async () => {
  errors.value = {} as TPromotionError

  let form = {}
  promotionForm.value.products.forEach((product: any, index: number) => {
    const typeEntry = selectedTypes.value[index]
    const typeValue = typeEntry?.value ?? typeEntry?.id
    const isCurrency = String(typeValue) === '2'
    const isPercentage = String(typeValue) === '1'

    form = {
      [`${index}][product_id`]: selectedProduct.value[index]?.id,
      [`${index}][type`]: typeEntry?.id,
      [`${index}][amount`]: isCurrency
        ? parseCurrencyFlexible(product.amount)
        : parsePercentFlexible(product.amount),
      ...form,
    }
  })
  let formData = {
    name: promotionForm.value.name,
    start_date: promotionForm.value.start_date,
    end_date: promotionForm.value.end_date,
    products: form,
  }
  const data = await promotionStore.actionCreatePromotion(formData)
  if (data.status == 201) {
    modalStore.setIsFormDirty(false)
    await router.push('/admin/sell/promotion')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
          .replace(/products\.\d+\.amount/g, 'amount')
          .replace(/products\.\d+\.product_id/g, 'product')
          .replace(/products\.\d+\.type/g, 'type')
      }
    })
  }
}

onMounted(() => {
  productStore.actionGetProducts({
    page: 1,
    withoutActivePromotion: 1,
    per_page: 9999999,
  })
})
</script>

<template>
  <div class="promotion-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_a_Promotion') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <div class="promotion-content gap-4">
            <UIInput
              @click="errors = {} as TPromotionError"
              @update:model-value="errors = {} as TPromotionError"
              :error="errors.name"
              v-model="promotionForm.name"
              :placeholder="`${$t('Name')} *`"
              :is-dirty="true"
            />
            <div></div>
            <UIInputDate
              @click="errors = {} as TPromotionError"
              @update:model-value="errors = {} as TPromotionError"
              :error="errors.start_date"
              v-model="promotionForm.start_date"
              :placeholder="`${$t('Start_date')} *`"
              :is-dirty="true"
            />
            <UIInputDate
              @click="errors = {} as TPromotionError"
              @update:model-value="errors = {} as TPromotionError"
              :error="errors.end_date"
              v-model="promotionForm.end_date"
              :placeholder="`${$t('End_date')} *`"
              :is-dirty="true"
            />
          </div>
          <template v-for="(product, index) in promotionForm.products">
            <div class="content gap-4">
              <SearchSelect
                @click="errors = {} as TPromotionError"
                :error="errors[`products.${index}.product_id`]"
                :data="compProduct"
                :placeholder="`${$t('Choose_product')} *`"
                :selected="selectedProduct[index]"
                @select="selectedProduct[index] = $event"
                :is-dirty="true"
              />
              <div class="component-mini gap-2">
                <SingleSelect
                  @click="errors = {} as TPromotionError"
                  :error="errors[`products.${index}.type`]"
                  :data="PROMOTION_TYPES"
                  :placeholder="`${$t('Type')} *`"
                  :selected="selectedTypes[index]"
                  @select="selectedTypes[index] = $event"
                  :is-dirty="true"
                  :none="false"
                />
                <UIInput
                  @click="errors = {} as TPromotionError"
                  @update:model-value="errors = {} as TPromotionError"
                  :symbol="selectedTypes[index]?.value == 2 ? '€' : ''"
                  symbol-class="translate-x-1"
                  :error="errors[`products.${index}.amount`]"
                  :placeholder="`${$t('Amount')} *`"
                  v-model="product.amount"
                  :is-dirty="true"
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeProduct(Number(index))"
                v-if="promotionForm.products.length > 1"
              >
                <IconMinus />
              </Button>
            </div>
          </template>
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
          <UIButton>{{ $t('Create') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/sell/promotion')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.promotion-create {
  padding: 32px;

  .form-content {
    margin-top: 50px;
    max-width: 596px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      position: relative;

      .icon-plus {
        color: var(--primary-500);
      }

      .content {
        display: grid;
        grid-template-columns: 290px 290px 24px;
        align-items: center;
        width: 100%;
        margin: auto;

        .component-mini {
          display: grid;
          grid-template-columns: 156px 128px;
        }
      }

      .promotion-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    }
  }
}
</style>
