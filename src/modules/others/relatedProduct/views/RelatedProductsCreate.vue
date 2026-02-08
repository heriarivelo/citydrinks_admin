<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UIRadioInput from '@/components/ui/inputs/UIRadioInput.vue'
import {
  TRelatedErrors,
  TRelatedProduct,
} from '@/modules/others/relatedProduct/store/types/relatedTypes.ts'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import IconMinus from '@/components/icons/IconMinus.vue'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { parseEuroCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useModalStore } from '@/store/modal'

const relatedStore = useRelatedStore()
const router = useRouter()
const modalStore = useModalStore()

const relatedProductInit = {
  name: '',
  price: '',
  cost_price: '',
  related_with: '',
}
const errors = ref({} as TRelatedErrors)
const relatedProductForm = ref([JSON.parse(JSON.stringify(relatedProductInit))])

const addRelated = () => {
  errors.value = {} as TRelatedErrors
  relatedProductForm.value.push(JSON.parse(JSON.stringify(relatedProductInit)))
}

const removeRelated = (index: number) => {
  if (relatedProductForm.value.length > 1) {
    errors.value = {} as TRelatedErrors
    relatedProductForm.value.splice(index, 1)
  }
}

const submit = async () => {
  errors.value = {} as TRelatedErrors
  let form = {}
  relatedProductForm.value.forEach(
    (product: TRelatedProduct, index: number) => {
      form = {
        [`related_products[${index}][name]`]: product.name,
        [`related_products[${index}][price]`]: parseEuroCurrency(product.price),
        [`related_products[${index}][cost_price]`]: parseEuroCurrency(
          product.cost_price
        ),
        [`related_products[${index}][related_with]`]: product.related_with,
        ...form,
      }
    }
  )
  const data = await relatedStore.actionCreateRelatedProduct(form)
  if (data.status == 201) {
    relatedProductForm.value = JSON.parse(JSON.stringify(relatedProductInit))
    modalStore.setIsFormDirty(false)
    await router.push('/admin/others/related')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
          .replace(/related_products\.\d+\.related_with/g, 'related with')
          .replace(/related_products\.\d+\.name/g, 'name')
          .replace(/related_products\.\d+\.price/g, 'price')
          .replace(/related_products\.\d+\.cost_price/g, 'cost price')
      }
    })
  }
}
</script>

<template>
  <div class="related-product-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_Related_Product') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <template v-for="(related, index) in relatedProductForm">
            <div class="content gap-4">
              <UIInput
                @click="errors = {} as TRelatedErrors"
                @update:model-value="errors = {} as TRelatedErrors"
                :error="errors[`related_products.${index}.name`]"
                :placeholder="`${$t('Related_product')} *`"
                v-model="related.name"
                :is-dirty="true"
              />
              <UIInput
                @click="errors = {} as TRelatedErrors"
                @update:model-value="errors = {} as TRelatedErrors"
                :error="errors[`related_products.${index}.cost_price`]"
                :placeholder="`${$t('Cost')} *`"
                v-model="related.cost_price"
                symbol="€"
                :is-dirty="true"
              />
              <UIInput
                @click="errors = {} as TRelatedErrors"
                @update:model-value="errors = {} as TRelatedErrors"
                :error="errors[`related_products.${index}.price`]"
                :placeholder="`${$t('Price')} *`"
                v-model="related.price"
                symbol="€"
                :is-dirty="true"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeRelated(index)"
                v-if="relatedProductForm.length > 1"
              >
                <IconMinus />
              </Button>
            </div>
            <div class="content gap-4">
              <UIRadioInput
                :error="errors[`related_products.${index}.related_with`]"
                :id="'Related_with_pallet' + index"
                @click="errors = {} as TRelatedErrors"
                v-model="related.related_with"
                :label="$t('Related_with_pallet')"
                :name="'related' + index"
                :inputValue="1"
              />
              <UIRadioInput
                :error="errors[`related_products.${index}.related_with`]"
                :id="'Related_with_product' + index"
                @click="errors = {} as TRelatedErrors"
                v-model="related.related_with"
                :label="$t('Related_with_product')"
                :name="'related' + index"
                :inputValue="2"
              />
            </div>
          </template>
          <Button
            type="button"
            variant="ghost"
            class="h-8 self-start px-2"
            @click="addRelated"
          >
            <IconPlus20 />
            <span class="body-text-2"> {{ $t('Add_related_product') }}</span>
          </Button>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Create') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/others/related')"
          >
            {{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.related-product-create {
  padding: 32px;

  .form-content {
    margin-top: 50px;

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
        grid-template-columns: 203px 203px 203px 24px;
        align-items: center;
        width: 100%;
        margin: auto;
      }
    }
  }
}
</style>
