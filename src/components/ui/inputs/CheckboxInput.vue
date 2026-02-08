<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: any
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const emits = defineEmits(['update:modelValue'])

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emits('update:modelValue', target.checked)
}
</script>

<template>
  <label class="custom-checkbox body-text-2">
    <input
      type="checkbox"
      :disabled="disabled"
      :checked="modelValue"
      @change="updateValue"
    />
    <span class="checkmark"></span>
    <slot></slot>
  </label>
</template>

<style scoped>
.custom-checkbox {
  display: inline;
  position: relative;
  padding-left: 26px;
  cursor: pointer;
  user-select: none;
  color: var(--gray-300);
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox input:disabled ~ .checkmark {
  cursor: not-allowed;
  opacity: 0.7;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  border-radius: 4px;
  background: none;
  border: 2px solid #bbb;
}

.custom-checkbox input:checked ~ .checkmark {
  background: url('@/assets/images/svg/checmark.svg');
  border: none;
}
</style>
