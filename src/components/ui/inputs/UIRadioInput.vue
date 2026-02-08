<script setup lang="ts">
import { useModalStore } from '@/store/modal'

const { inputValue, isDirty } = withDefaults(
  defineProps<{
    label?: string
    id?: string
    name?: string
    inputValue?: string | number
    modelValue?: string | number
    error?: string
    isDirty?: boolean
  }>(),
  {
    label: '',
    id: '',
    name: '',
    inputValue: '',
    modelValue: '',
    error: '',
  }
)

const emit = defineEmits(['update:modelValue'])
const modalStore = useModalStore()

const updateValue = () => {
  if (isDirty) {
    modalStore.setIsFormDirty(true)
  }
  emit('update:modelValue', inputValue)
}
</script>

<template>
  <label
    :for="id"
    class="flex cursor-pointer items-center gap-2"
    @click="updateValue"
  >
    <input
      :id="id"
      :name="name"
      type="radio"
      :checked="inputValue == modelValue"
      :value="inputValue"
    />
    <span class="radio"></span>
    <span class="name body-text">{{ label }}</span>
    <span class="error-text body-text" v-if="error">{{ error }}</span>
  </label>
</template>

<style scoped>
label {
  position: relative;

  .name {
    color: var(--neutral-400);
  }

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

  input {
    display: none;
  }

  input:checked ~ .radio {
    background: var(--neutral-400);
    border: 1px solid var(--neutral-400);

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: none;
      border: 2px solid white;
      z-index: 1;
    }
  }

  .radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: none;
    border: 1px solid var(--neutral-300);
    padding: 2px;
    position: relative;
  }
}
</style>
