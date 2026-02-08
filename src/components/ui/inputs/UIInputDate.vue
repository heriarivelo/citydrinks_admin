<script setup lang="ts">
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconCancel from '@/components/icons/IconCancel.vue'
import { useModalStore } from '@/store/modal'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    modelValue?: string | number
    disabled?: boolean
    error?: string
    mode?: 'range'
    inline?: boolean
    clear?: boolean
    isDirty?: boolean
    isFormDialog?: boolean
    disableFuture?: boolean
  }>(),
  {
    disableFuture: false,
  }
)
const emit = defineEmits(['update:modelValue'])
const modalStore = useModalStore()
const flatpickrRef = ref(null)
let fpInstance = null

const convertDateRange = (inputDateRange) => {
  const [startDate, endDate] = inputDateRange.split(' to ').map((date) => date)
  return `${startDate},${endDate}`
}

const updateDate = (e) => {
  if (props.isFormDialog) {
    modalStore.isFormDialog = true
  }
  if (props.isDirty) {
    modalStore.setIsFormDirty(true)
  }
  if (props.mode !== 'range') {
    emit('update:modelValue', e.target.value)
  } else {
    if (e.target.value.includes('to')) {
      emit('update:modelValue', convertDateRange(e.target.value))
    }
  }
}

const clear = (e: Event) => {
  e.preventDefault()
  emit('update:modelValue', '')
  if (fpInstance) {
    fpInstance.clear()
  }
}

onMounted(() => {
  const params: any = {
    allowInput: true,
    dateFormat: 'd-m-Y',
    locale: {
      firstDayOfWeek: 1,
    },
  }

  if (props.disableFuture) {
    params.maxDate = 'today'
  }

  if (props.mode) {
    params.mode = props.mode
  }
  if (props.inline) {
    params.inline = props.inline
  }
  fpInstance = flatpickr(flatpickrRef.value, params)
})

onUnmounted(() => {
  // Destroy flatpickr to remove event listeners and prevent memory leaks
  if (fpInstance) {
    fpInstance.destroy()
    fpInstance = null
  }
})

watch(props, (value, oldValue) => {
  if (value.clear || oldValue.clear) {
    if (fpInstance) {
      fpInstance.clear()
    }
  }
})
</script>

<template>
  <label
    class="h-[42px] cursor-pointer"
    :class="{ error, 'min-width': mode === 'range' }"
    @click="flatpickrRef.focus()"
  >
    <IconCalendar v-if="!modelValue || disabled" />
    <IconCancel
      class="cancel-icon"
      v-if="modelValue && !disabled"
      @click.stop="clear"
    />
    <input
      :value="modelValue"
      :disabled="disabled"
      @input="updateDate"
      ref="flatpickrRef"
      type="text"
      class="body-text"
      :placeholder="placeholder"
    />
    <span class="placeholder subtitle">{{ placeholder }}</span>
    <span class="error-text body-text" v-if="error">{{ error }}</span>
  </label>
</template>

<style scoped lang="scss">
.cancel-icon {
  z-index: 1;
}
label {
  position: relative;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  &.min-width {
    min-width: 246px;
  }

  &.error {
    border: 1px solid var(--warning-500);
  }

  .placeholder {
    display: none;
    position: absolute;
    left: 16px;
    top: -7px;
    background: var(--white);
  }

  input {
    position: relative;
    padding: 8px 16px;

    height: 38px;
    color: var(--neutral-400);

    &::placeholder {
      color: var(--gray-200);
    }
  }

  svg {
    position: absolute;
    right: 14px;
    top: 10px;
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
    margin: 0;
    width: 100%;
    background: none;
  }
}
</style>
