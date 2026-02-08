<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { cn } from '@/lib/utils'
import { useModalStore } from '@/store/modal'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    showKey?: string
    selectedKey?: string
    data?: any[]
    selected?: {}
    error?: string
    disabled?: boolean
    none?: boolean
    showFromSelected?: boolean
    isDirty?: boolean
    isFormDialog?: boolean
  }>(),
  {
    placeholder: '',
    showKey: 'name',
    selectedKey: 'id',
    disabled: false,
    none: true,
  }
)

const emit = defineEmits(['select'])
const modalStore = useModalStore()
const open = ref(false)

const openSelect = () => {
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
  if (datum?.[props.selectedKey] || datum?.[props.selectedKey] == '0') {
    emit('select', datum)
  } else {
    emit('select', {})
  }
}

const selectedData = computed(() => {
  if (!props.showFromSelected) {
    return props.data?.filter(
      (item) => item[props.selectedKey] == props.selected?.[props.selectedKey]
    )
  } else {
    return props.selected ? [props.selected] : []
  }
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
      :class="
        cn(
          'select flex h-[42px] cursor-pointer items-center',
          open && 'open',
          error && 'error',
          disabled && 'cursor-default'
        )
      "
      @click="!disabled ? openSelect() : ''"
    >
      <p
        class="placeholder subtitle"
        :class="{ show: selectedData?.[0]?.[showKey] }"
      >
        {{ placeholder }}
      </p>
      <p
        :class="
          cn(
            'body-text selected-name cursor-pointer',
            selectedData?.[0]?.[showKey] && 'selected',
            disabled && 'cursor-default !text-[var(--neutral-400)]'
          )
        "
      >
        {{ selectedData?.[0]?.[showKey] ?? placeholder }}
      </p>
      <IconArrow class="arrow" />
      <span class="error-text body-text" v-if="error">{{ error }}</span>
    </div>
    <div class="data-for-select custom-scrollbar" v-if="open">
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
      width: calc(100% - 20px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
