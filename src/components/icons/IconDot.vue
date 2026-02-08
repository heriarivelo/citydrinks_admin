<script setup lang="ts">
import { computed } from 'vue'

const { type } = defineProps<{
  type: 'Delivered' | 'Reserved' | 'Refund' | 'Declined'
}>()

const bg = computed(() => {
  switch (type) {
    case 'Delivered':
      return 'bg-[var(--success-500)]'
    case 'Reserved':
    case 'Declined':
      return 'bg-[var(--warning-400)]'
    case 'Refund':
      return 'bg-[var(--status)]'
  }
})
</script>

<template>
  <div :class="`size-2 rounded-full ${bg}`" />
</template>
