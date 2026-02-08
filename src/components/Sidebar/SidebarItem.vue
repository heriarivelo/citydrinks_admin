<script setup lang="ts">
import { clearAllScrollPositions, cn } from '@/lib/utils'
import { RouterLink } from 'vue-router'

const { isActive, title, path, className } = defineProps<{
  title: string
  path: string
  isActive: boolean
  className?: string
}>()
</script>
<template>
  <RouterLink
    :to="path"
    :class="
      cn(
        'body-text py-2 pe-2.5 ps-12 transition-colors',
        !isActive && 'hover:bg-indigo-50/30',
        className
      )
    "
    @click="clearAllScrollPositions"
  >
    <div
      class="rounded-s-sm py-0.5 ps-2"
      :class="cn(isActive && 'border-e-2 border-primary bg-indigo-50')"
    >
      {{ $t(title) }}
    </div>
  </RouterLink>
</template>
