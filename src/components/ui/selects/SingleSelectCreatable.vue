<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { parseNumber } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    showKey?: string
    selectedKey?: string
    data?: any[]
    selected?: {}
    maxValue?: string
    error?: string
    disabled?: boolean
    none?: boolean
    allowCustom?: boolean
    isInteger?: boolean
    isDirty?: boolean
    isFormDialog?: boolean
  }>(),
  {
    placeholder: '',
    showKey: 'name',
    selectedKey: 'id',
    disabled: false,
    none: true,
    allowCustom: true,
    isInteger: false,
  }
)

const emit = defineEmits(['select', 'update:selected', 'blur'])
const modalStore = useModalStore()
const open = ref(false)
const customValue = ref('')
const isCustom = ref(false)

const selfError = ref(props.error)

watch(
  () => props.selected,
  (newSelected) => {
    if (!newSelected || !newSelected[props.selectedKey]) {
      customValue.value = ''
      isCustom.value = false
    } else if (
      !props.data?.some(
        (item) => item[props.selectedKey] === newSelected[props.selectedKey]
      )
    ) {
      customValue.value = newSelected[props.selectedKey]?.toString() || ''
      isCustom.value = true
    } else {
      isCustom.value = false
      customValue.value = ''
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.error,
  (newError) => {
    selfError.value = newError
  }
)

const openSelect = () => {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    setTimeout(() => {
      window.addEventListener('click', closeSelect)
    })
  } else {
    closeSelect()
  }
}

const closeSelect = () => {
  open.value = false
  window.removeEventListener('click', closeSelect)
}

const select = (datum: any) => {
  if (props.isFormDialog) {
    modalStore.isFormDialog = true
  }
  if (props.isDirty) {
    modalStore.setIsFormDirty(true)
  }
  isCustom.value = false
  customValue.value = ''

  if (datum?.[props.selectedKey] || datum?.[props.selectedKey] === '0') {
    emit('select', datum)
  } else {
    emit('select', {})
  }

  if (
    props.maxValue &&
    parseNumber(datum?.[props.selectedKey]) > parseNumber(props.maxValue)
  ) {
    isCustom.value = true
    customValue.value = props.maxValue
    selfError.value = `max quantity is ${props.maxValue}`

    setTimeout(() => {
      selfError.value = ''
    }, 3000)
  }

  closeSelect()
}

const updateCustomValue = (event: Event) => {
  if (props.isFormDialog) {
    modalStore.isFormDialog = true
  }
  if (props.isDirty) {
    modalStore.setIsFormDirty(true)
  }
  const target = event.target as HTMLInputElement
  let value = target.value

  // Handle integer validation if isInteger is true
  if (props.isInteger) {
    // Remove any non-digit characters
    value = value.replace(/\D/g, '')

    // Update the input value to show only numbers
    target.value = value
  }

  if (props.maxValue && parseNumber(value) > parseNumber(props.maxValue)) {
    value = props.maxValue
    target.value = value
    selfError.value = `max quantity is ${props.maxValue}`

    setTimeout(() => {
      selfError.value = ''
    }, 3000)
  }

  customValue.value = value
  isCustom.value = true

  const emitValue = props.isInteger ? parseInt(value) || 0 : value
  emit('select', {
    [props.selectedKey]: emitValue,
    [props.showKey]: emitValue.toString(),
  })
}

const handleBlur = () => {
  emit('blur')
}

const selectedData = computed(() => {
  if (isCustom.value) {
    const displayValue = customValue.value
    return [
      {
        [props.selectedKey]: displayValue,
        [props.showKey]: displayValue,
      },
    ]
  }
  return props.data?.filter(
    (item) => item[props.selectedKey] === props.selected?.[props.selectedKey]
  )
})

const compData = computed(() =>
  props.none
    ? [{ [props.showKey]: 'None' }, ...(props?.data ?? [])]
    : (props?.data ?? [])
)
</script>

<template>
  <div class="select-content">
    <div
      class="select flex h-[42px] cursor-pointer items-center"
      :class="{ open, selfError, disabled: props.disabled }"
      @click="openSelect"
    >
      <p
        class="placeholder subtitle"
        :class="{ show: selectedData?.[0]?.[showKey] || customValue }"
      >
        {{ placeholder }}
      </p>

      <input
        v-if="allowCustom"
        :type="isInteger ? 'numeric' : 'text'"
        class="body-text selected-input"
        :value="selectedData?.[0]?.[showKey] || ''"
        @input="updateCustomValue"
        @blur="handleBlur"
        :placeholder="placeholder"
        :disabled="props.disabled"
      />
      <p
        v-else
        class="body-text selected-name"
        :class="{ selected: selectedData?.[0]?.[showKey] }"
      >
        {{ selectedData?.[0]?.[showKey] ?? placeholder }}
      </p>

      <IconArrow class="arrow" />
      <span class="error-text body-text" v-if="selfError">{{ selfError }}</span>
    </div>

    <div class="data-for-select custom-scrollbar" v-if="open">
      <div
        v-for="datum in compData"
        class="select-item body-text flex cursor-pointer items-center rounded-sm px-2 py-1 transition-colors hover:bg-muted"
        :class="{
          selected: datum[selectedKey] === selectedData?.[0]?.[selectedKey],
        }"
        @click="select(datum)"
      >
        {{ datum[showKey] }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.select-content {
  position: relative;

  .select {
    padding: 8px 14px 8px 16px;
    border-radius: 4px;
    border: 1px solid var(--gray-200);

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.error {
      border: 1px solid var(--warning-500);
    }

    .selected-input {
      width: calc(100% - 20px);
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;

      &::placeholder {
        color: var(--gray-200);
      }

      &:disabled {
        cursor: not-allowed;
      }
    }

    .selected-name {
      width: calc(100% - 20px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:not(.selected) {
        color: var(--gray-200);
      }
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

    .placeholder {
      display: none;
      position: absolute;
      left: 16px;
      top: -7px;
      background: var(--white);
      color: var(--gray-300);
      padding: 0 4px;

      &.show {
        display: inline-block;
      }
    }

    .arrow {
      fill: none;
      transition: 0.3s all;
    }

    &.open {
      .arrow {
        transform: rotateX(-180deg);
      }
    }
  }

  .data-for-select {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 2px);
    z-index: 100;
    background: var(--white);
    border-radius: 4px;
    padding: 8px;
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 0 0 10px 0 #d5d8e6;

    .select-item {
      &.selected {
        background-color: var(--gray-100);
      }
    }
  }
}
</style>
