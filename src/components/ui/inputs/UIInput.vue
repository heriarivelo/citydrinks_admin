<script setup lang="ts">
import IconSearch from '@/components/icons/IconSearch.vue'
import { cn, formatValue } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    modelValue?: string | number
    icon?: string
    disabled?: boolean
    limit?: boolean
    error?: string
    errorPosition?: 'top' | 'bottom'
    inputType?: string
    symbol?: string
    isInteger?: boolean
    symbolClass?: string
    isDirty?: boolean
    isFormDialog?: boolean
    inputClass?: string
  }>(),
  {
    inputType: 'text',
    isInteger: false,
    errorPosition: 'top',
  }
)

const emit = defineEmits(['update:modelValue', 'update:focus'])
const modalStore = useModalStore()
const focused = ref(false)
const hideSymbol = ref(false)
const input = ref(null)

const formattedValue = computed(() => {
  if (props.symbol === '€' && props.modelValue) {
    return formatValue(props.modelValue)
  }
  return String(props.modelValue || '')
})

const updateValue = (event: Event) => {
  if (props.isFormDialog) {
    modalStore.isFormDialog = true
  }
  if (props.isDirty) {
    modalStore.setIsFormDirty(true)
  }
  const target = event.target as HTMLInputElement
  let inputValue = target.value

  if (props.isInteger) {
    inputValue = inputValue.replace(/[^\d]/g, '')
  }

  if (props.symbol === '%') {
    inputValue = inputValue.replace(/[^\d]/g, '')
    if (inputValue.length > 2) {
      inputValue = inputValue.slice(0, 2)
    }
  }

  if (props.symbol === '€' && inputValue.endsWith('.')) {
    inputValue = inputValue.slice(0, -1) + ','
  }

  let finalValue = inputValue

  if (props.symbol === '€') {
    finalValue = inputValue
  }

  target.value = finalValue

  emit('update:modelValue', finalValue)
}

const updateFocus = (value: boolean) => {
  if (props.isInteger) {
    if (!value) {
      const currentValue = String(props.modelValue || '')
      const trimmedValue = currentValue.replace(/^0+/, '') || '0'
      emit('update:modelValue', trimmedValue)
    }
  }

  if (props.symbol === '€') {
    if (value) {
      // On focus, remove the ",00" if present or if value is "0,00" make it empty
      const currentValue = String(props.modelValue || '')
      if (currentValue === '0,00') {
        emit('update:modelValue', '')
      } else if (currentValue.endsWith(',00')) {
        const cleanedValue = currentValue.slice(0, -3) // Remove ",00"
        emit('update:modelValue', cleanedValue)
      }
    } else {
      const currentValue = String(props.modelValue || '')

      // If empty, do not add ",00"
      if (currentValue.trim() === '') {
        emit('update:modelValue', '')
        return
      }

      let [integerPart, decimalPart = ''] = currentValue.split(',')

      // Ensure decimal part always has two digits
      if (decimalPart.length === 0) {
        decimalPart = '00'
      } else if (decimalPart.length === 1) {
        decimalPart += '0'
      } else if (decimalPart.length > 2) {
        decimalPart = decimalPart.slice(0, 2)
      }

      const formattedValue = `${integerPart},${decimalPart}`

      emit('update:modelValue', formattedValue)
    }
  } else {
    if (props.modelValue === '0') {
      emit('update:modelValue', '')
    }
  }

  focused.value = value
  hideSymbol.value = value
  emit('update:focus', value)
}

const handleSelect = () => {
  hideSymbol.value = true
}

watch(props, async (value, oldValue) => {
  if (oldValue.inputType) {
    input.value.type = props.inputType
    await nextTick()
  }
})
</script>

<template>
  <label :class="{ icon, error }">
    <IconSearch v-if="icon === 'search'" />
    <input
      @click="updateFocus(true)"
      @select="handleSelect"
      @blur="updateFocus(false)"
      :value="formattedValue"
      :disabled="disabled"
      @input="updateValue"
      :type="inputType"
      ref="input"
      :class="cn('body-text', props.inputClass)"
      :placeholder="placeholder"
    />
    <span
      :class="
        cn(
          'currency-symbol pointer-events-none absolute top-1/2 -translate-y-1/2',
          symbolClass
        )
      "
      :style="{
        left: `${typeof props.modelValue === 'string' ? props.modelValue.replace(/\./g, '').length * (props.symbol === '€' ? 10 : 10) + (props.symbol === '€' ? 10 : 16) : 30}px`,
      }"
      v-if="!focused && !hideSymbol && symbol && props.modelValue"
    >
      {{ symbol }}
    </span>

    <span class="placeholder subtitle">{{ placeholder }}</span>
    <span
      :class="
        cn(
          'error-text body-text absolute',
          errorPosition === 'top'
            ? 'bottom-[calc(100%+14px)]'
            : 'error-below top-[calc(100%+14px)]'
        )
      "
      v-if="error"
      >{{ error }}</span
    >
  </label>
</template>

<style scoped lang="scss">
.currency-symbol {
  color: var(--neutral-400);
}

label {
  border: 1px solid var(--gray-200);
  position: relative;
  padding: 8px 16px;
  border-radius: 4px;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  &.error {
    border: 1px solid var(--warning-500);
  }

  &.icon {
    padding-left: 44px;

    svg {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .placeholder {
    display: none;
    position: absolute;
    left: 16px;
    top: -7px;
    background: var(--white);
  }

  input {
    color: var(--neutral-400);

    &::placeholder {
      color: var(--gray-200);
    }
  }

  .error-text {
    padding: 4px 10px;
    color: var(--white);
    background: var(--warning-400);
    border-radius: 4px;
    width: 100%;
    left: 0;
    z-index: 1;

    &:before {
      content: '';
      position: absolute;
      bottom: -17px;
      left: 8px;
      transform: translateY(-50%);
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 12px solid var(--warning-400);
    }

    &.error-below {
      top: calc(100% + 14px);
      bottom: auto;

      &:before {
        top: -6px;
        bottom: auto;
        border-top: none;
        border-bottom: 12px solid var(--warning-400);
      }
    }
  }

  input:focus {
    &::placeholder {
      color: transparent;
    }
  }
  input:focus ~ .placeholder {
    display: inline-block;
  }

  input:not(:placeholder-shown) {
    color: var(--neutral-400);
  }
  input:not(:placeholder-shown) ~ .placeholder {
    display: inline-block;
  }

  input {
    padding: 0;
    margin: 0;
    width: 100%;
    background: none;
  }
}
</style>
