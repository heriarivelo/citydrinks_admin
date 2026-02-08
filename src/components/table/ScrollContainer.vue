<script setup lang="ts">
import { clearAllScrollPositions } from '@/lib/utils'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    dynamicHeightOffset?: string
  }>(),
  {
    dynamicHeightOffset: '320',
  }
)

const route = useRoute()
const containerRef = ref<HTMLDivElement | null>(null)

const getStorageKey = () => {
  const baseKey = props.storageKey || route.name
  return `scroll_position_${String(baseKey)}`
}

const handleScroll = () => {
  if (containerRef.value) {
    const position = containerRef.value.scrollTop
    sessionStorage.setItem(getStorageKey(), position.toString())
  }
}

const restoreScrollPosition = () => {
  if (containerRef.value) {
    const savedPosition = sessionStorage.getItem(getStorageKey())
    if (savedPosition) {
      setTimeout(() => {
        if (containerRef.value) {
          containerRef.value.scrollTop = parseInt(savedPosition)
        }
      }, 0)
    } else {
      containerRef.value.scrollTop = 0
    }
  }
}

const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

defineExpose({
  restoreScrollPosition,
  saveScrollPosition: handleScroll,
  scrollToTop,
  containerRef,
})

onMounted(() => {
  restoreScrollPosition()
  window.addEventListener('beforeunload', clearAllScrollPositions)
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('beforeunload', clearAllScrollPositions)
})
</script>

<template>
  <div
    ref="containerRef"
    class="custom-scrollbar overflow-y-auto"
    :style="{ maxHeight: `calc(100dvh - ${dynamicHeightOffset}px)` }"
    @scroll="handleScroll"
  >
    <slot></slot>
  </div>
</template>
