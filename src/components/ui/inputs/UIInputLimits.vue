<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    modelValue?: string[]
    disabled?: boolean
    error?: string
  }>(),
  {
    placeholder: null,
    modelValue: null,
    disabled: null,
    error: null,
  }
)

const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')
const input = ref()
const numbers = ref([] as string[])

const sortNumbers = (arr: string[]) => {
  return [...arr].sort((a, b) => parseFloat(a) - parseFloat(b))
}

const addNumber = () => {
  const trimmedValue = inputValue.value

  if (trimmedValue && !numbers.value.includes(trimmedValue)) {
    const newNumbers = [...numbers.value, trimmedValue]
    numbers.value = sortNumbers(newNumbers)
    emit('update:modelValue', numbers.value)
  }

  inputValue.value = ''
}

const handleBackspace = (event: KeyboardEvent) => {
  if (
    inputValue.value === '' &&
    event.key === 'Backspace' &&
    numbers.value.length > 0
  ) {
    const newNumbers = numbers.value.slice(0, -1)
    numbers.value = sortNumbers(newNumbers)
    emit('update:modelValue', numbers.value)
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const currentSorted = JSON.stringify(sortNumbers(numbers.value))
      const newSorted = JSON.stringify(sortNumbers(newValue))

      if (currentSorted !== newSorted) {
        numbers.value = sortNumbers(newValue)
      }
    } else {
      numbers.value = []
    }
  },
  { immediate: true }
)
</script>

<template>
  <div :class="{ error }" @click="input.focus()">
    <div class="input-numbers flex items-center" :class="{ error }">
      <div
        v-if="numbers.length"
        v-for="(number, index) in numbers"
        :key="index"
        class="numbers subtitle-2 flex gap-1"
      >
        {{ number }}
      </div>
      <div>
        <input
          class="body-text"
          ref="input"
          v-model="inputValue"
          @keyup.enter="addNumber"
          @keyup.backspace="handleBackspace"
          type="number"
          :placeholder="placeholder"
          :disabled="disabled"
        />
      </div>
    </div>
    <span class="error-text body-text" v-if="error">{{ error }}</span>
  </div>
</template>
<style scoped lang="scss">
div {
  position: relative;

  .error-text {
    padding: 4px 10px;
    color: var(--white);
    background: var(--warning-400);
    border-radius: 4px;
    position: absolute;
    width: 100%;
    left: 0;
    bottom: calc(100% + 14px);
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
  }
}
.input-numbers {
  border: 1px solid var(--gray-200);
  position: relative;
  padding: 7px 16px;
  border-radius: 4px;
  overflow-x: hidden;

  &.error {
    border: 1px solid var(--warning-500);
  }

  input {
    background: none;
  }

  .numbers {
    margin-right: 4px;
    padding: 5px;
    background: var(--gray-200);
    border-radius: 8px;
    color: var(--white);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
}
</style>
