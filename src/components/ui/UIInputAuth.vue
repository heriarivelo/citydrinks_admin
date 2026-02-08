<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['update:modelValue'])

withDefaults(
  defineProps<{
    legend?: string
    type?: string
    placeholder?: string
    error?: string
    fieldset?: string
    errorWithoutText?: string
  }>(),
  {
    legend: '',
    type: '',
    placeholder: '',
    error: '',
    fieldset: '',
    errorWithoutText: '',
  }
)

const open = ref(true)

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <fieldset
    :class="{ error: error || errorWithoutText, auth: fieldset === 'auth' }"
  >
    <legend class="body-text-2">{{ legend }}</legend>
    <label>
      <input
        class="body-text"
        :type="type && open ? type : 'text'"
        :placeholder="placeholder"
        autocomplete="nope"
        @input="updateValue"
      />
      <span
        class="show-hide body-text"
        v-if="type === 'password'"
        @click="open = !open"
        >{{ !open ? $t('Hide') : $t('Show') }}</span
      >
    </label>
    <span class="error-text body-text" v-if="error">{{ error }}</span>
  </fieldset>
</template>

<style scoped lang="scss">
@import 'scss/ui-input';
</style>
