<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { cn } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { X } from 'lucide-vue-next'
import { computed, ref, watchEffect } from 'vue'
import { Button } from '../button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    showKey?: string
    selectedKey?: string
    data?: any[]
    selected?: {}
    error?: string
    disabled?: boolean
    isDirty?: boolean
    isFormDialog?: boolean
    containerClass?: string
    isClearable?: boolean
    validate?: (datum: any) => boolean | string
  }>(),
  {
    placeholder: '',
    showKey: 'name',
    selectedKey: 'id',
    disabled: false,
    isClearable: false,
    validate: () => true,
  }
)

const emit = defineEmits(['select'])
const modalStore = useModalStore()
const searchValue = ref('')
const input = ref<HTMLInputElement | null>(null)
const popoverOpen = ref(false)

const popoverModel = computed({
  get: () => !props.disabled && popoverOpen.value,
  set: (value) => {
    if (!props.disabled) {
      popoverOpen.value = value
    }
  },
})

const select = (datum: any) => {
  if (props.validate) {
    const validationResult = props.validate(datum)
    if (validationResult !== true) {
      popoverOpen.value = false
      return
    }
  }

  if (props.isFormDialog) {
    modalStore.isFormDialog = true
  }
  if (props.isDirty) {
    modalStore.setIsFormDirty(true)
  }
  searchValue.value = datum[props.showKey]
  emit('select', datum)
  popoverOpen.value = false
}

const clearSelection = () => {
  searchValue.value = ''
  emit('select', {})
  input.value?.focus()
  popoverOpen.value = true
}

const selectedData = computed(() =>
  props.data?.filter(
    (item) => item[props.selectedKey] == props.selected?.[props.selectedKey]
  )
)
const compData = computed(() => {
  const searchTerms = searchValue.value?.toLowerCase().split(' ')
  return props.data?.filter((product) => {
    const productValue = product?.[props.showKey]?.toLowerCase()
    return searchTerms?.every((term) => productValue?.includes(term))
  })
})

const togglePopover = () => {
  if (props.disabled) return
  if (popoverOpen.value) {
    popoverOpen.value = false
  } else {
    popoverOpen.value = true
    input.value?.focus()
  }
}

watchEffect(() => {
  searchValue.value = props.selected?.[props.showKey] ?? ''
})
</script>

<template>
  <div :class="cn('select-content', props.containerClass)">
    <Popover v-model:open="popoverModel">
      <PopoverTrigger as="div">
        <div
          id="search-select"
          :class="
            cn(
              'select flex h-[42px] cursor-pointer items-center justify-between',
              error && 'error',
              disabled && 'cursor-default'
            )
          "
          @click="input?.focus()"
        >
          <input
            type="text"
            class="body-text cursor-pointer read-only:cursor-default"
            :placeholder="placeholder"
            ref="input"
            v-model="searchValue"
            :readonly="disabled"
            @click.stop="togglePopover"
            @input="popoverOpen = true"
          />
          <p
            class="placeholder subtitle"
            :class="{ show: selectedData?.[0]?.[showKey] }"
          >
            {{ placeholder }}
          </p>
          <Button
            v-if="searchValue && !disabled"
            type="button"
            size="iconSm"
            variant="ghost"
            class="text-[var(--neutral-400)]"
            @click.stop="clearSelection"
          >
            <X />
          </Button>
          <IconArrow class="arrow" />
          <span class="error-text body-text" v-if="error">{{ error }}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        class="data-for-select custom-scrollbar max-h-[300px] w-[var(--radix-popover-trigger-width)] overflow-y-auto p-2"
      >
        <div
          class="select-item body-text flex cursor-pointer items-center rounded-sm px-2 py-1 transition-colors hover:bg-muted"
          :class="{
            selected: datum[selectedKey] === selectedData?.[selectedKey],
          }"
          v-for="datum in compData"
          @click="select(datum)"
        >
          {{ datum?.[showKey] }}
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.select-content {
  position: relative;

  .select {
    padding: 7px 14px 7px 16px;
    border-radius: 4px;
    border: 1px solid var(--gray-200);
    width: 100%;

    input {
      width: 100%;
    }

    &.error {
      border: 1px solid var(--warning-500);
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

    .selected-name {
      //min-width: 156px;
      width: calc(100% - 20px);

      &:not(.selected) {
        color: var(--gray-200);
      }
    }

    .placeholder {
      display: none;
      position: absolute;
      left: 16px;
      top: -7px;
      background: var(--white);
      color: var(--gray-300);

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
        span {
          background: url('@/assets/images/svg/checmark.svg');
          border: none;
        }
      }

      span {
        width: 18px;
        height: 18px;
        margin-right: 13px;
        display: block;
        background: none;
        border: 1px solid #eeeeee;
        border-radius: 4px;
      }
    }
  }
}
</style>
