<script setup lang="ts">
import IconArrow from '@/components/icons/IconArrow.vue'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    placeholder?: string
    showKey?: string
    selectedKey?: string
    data?: any[]
    selected?: any[]
  }>(),
  {
    placeholder: '',
    showKey: 'name',
    selectedKey: 'id',
  }
)

const emit = defineEmits(['select'])

const open = ref(false)

const openSelect = (e: MouseEvent) => {
  open.value = !open.value
  if (open.value) {
    setTimeout(() => {
      window.addEventListener('click', closeSelect)
    })
  } else {
    closeSelect(e)
  }
}

const closeSelect = (e?: MouseEvent) => {
  if (
    !e ||
    !e.target ||
    !(e.target as HTMLElement).closest('.data-for-select')
  ) {
    open.value = false
    window.removeEventListener('click', closeSelect)
  }
}

const select = (datum: any) => {
  emit('select', datum)
}
</script>

<template>
  <div class="select-content">
    <div
      class="select flex cursor-pointer items-center"
      :class="{ open }"
      @click.exact="openSelect"
    >
      <p
        class="placeholder subtitle"
        :class="{ show: selected.length || open }"
      >
        {{ placeholder }}
      </p>
      <p
        class="body-text selected-name cursor-pointer"
        :class="{ selected: selected?.length }"
      >
        {{
          selected.length
            ? selected?.length == 1
              ? selected?.[0]?.[showKey]
              : selected?.length + ' items'
            : open
              ? 'None'
              : placeholder
        }}
      </p>
      <IconArrow class="arrow" />
    </div>
    <div class="data-for-select flex flex-col gap-2" v-if="open">
      <div
        class="select-item body-text flex cursor-pointer items-center"
        :class="{
          selected: selected?.filter(
            (item) => item?.[selectedKey] == datum[selectedKey]
          ).length,
        }"
        v-for="datum in data"
        @click="select(datum)"
      >
        <span></span>
        {{ datum?.[showKey] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-content {
  position: relative;

  .select {
    padding: 8px 14px 8px 16px;
    border-radius: 4px;
    border: 1px solid var(--gray-200);

    .selected-name {
      min-width: 156px;
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
    padding: 8px 19px;
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
        position: relative;
      }
    }
  }
}
</style>
