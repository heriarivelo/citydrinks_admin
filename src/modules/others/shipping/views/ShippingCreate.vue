<script setup lang="ts">
import IconMinus from '@/components/icons/IconMinus.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  TShipping,
  TShippingErrors,
} from '@/modules/others/shipping/store/types/shippingTypes.ts'
import { useShippingStore } from '@/modules/others/shipping/store/shipping.ts'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import { SHIPPING_TYPES } from '@/modules/others/shipping/constants.ts'
import { parseEuroCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import IconPlus20 from '@/components/icons/IconPlus20.vue'
import { useModalStore } from '@/store/modal'

const shippingObject = {
  name: '',
  type: '',
  cost: '',
}
const shippingForm = ref([
  {
    name: '',
    type: '',
    cost: '',
  },
] as TShipping[])
const errors = ref({})
const router = useRouter()
const shippingStore = useShippingStore()
const selectedType = ref([])
const modalStore = useModalStore()

const addShipping = () => {
  errors.value = {} as TShippingErrors
  shippingForm.value.push(JSON.parse(JSON.stringify(shippingObject)))
}

const removeShipping = (index: number) => {
  if (shippingForm.value.length > 1) {
    errors.value = {} as TShippingErrors
    shippingForm.value.splice(index, 1)
  }
}

const submit = async () => {
  errors.value = {} as TShippingErrors
  let form = {}
  shippingForm.value.forEach((product: TShipping, index: number) => {
    form = {
      [`shipping[${index}][name]`]: product.name,
      [`shipping[${index}][type]`]: selectedType.value?.[index]?.id,
      [`shipping[${index}][cost]`]: parseEuroCurrency(product.cost),
      ...form,
    }
  })
  const data = await shippingStore.actionCreateShipping(form)
  if (data.status == 201) {
    modalStore.setIsFormDirty(false)
    await router.push('/admin/others/shipping')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
          .replace(/shipping\.\d+\.name/g, 'name')
          .replace(/shipping\.\d+\.type/g, 'type')
          .replace(/shipping\.\d+\.cost/g, 'cost')
      }
    })
  }
}
</script>

<template>
  <div class="related-product-create flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_Shipping') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="flex flex-col gap-4">
          <template v-for="(ship, index) in shippingForm">
            <div class="content gap-4">
              <UIInput
                @click="errors = {} as TShippingErrors"
                @update:model-value="errors = {} as TShippingErrors"
                :error="errors[`shipping.${index}.name`]"
                :placeholder="`${$t('Name')} *`"
                v-model="ship.name"
                :is-dirty="true"
              />
              <SingleSelect
                @click="errors = {} as TShippingErrors"
                @update:model-value="errors = {} as TShippingErrors"
                :data="SHIPPING_TYPES"
                :error="errors[`shipping.${index}.type`]"
                :placeholder="`${$t('Type')} *`"
                :selected="selectedType[index]"
                @select="selectedType[index] = $event"
                :is-dirty="true"
                :none="false"
              />
              <UIInput
                @click="errors = {} as TShippingErrors"
                @update:model-value="errors = {} as TShippingErrors"
                :error="errors[`shipping.${index}.cost`]"
                :placeholder="`${$t('Cost')} *`"
                v-model="ship.cost"
                symbol="€"
                :is-dirty="true"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                class="w-6 transition-opacity hover:bg-transparent hover:opacity-90 [&_svg]:size-6"
                @click="removeShipping(index)"
                v-if="shippingForm.length > 1"
              >
                <IconMinus />
              </Button>
            </div>
          </template>
          <Button
            type="button"
            variant="ghost"
            class="h-8 self-start px-2"
            @click="addShipping"
          >
            <IconPlus20 />
            <span class="body-text-2"> {{ $t('Add_shipping') }}</span>
          </Button>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Create') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/others/shipping')"
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
