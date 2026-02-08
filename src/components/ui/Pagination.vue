<script setup lang="ts">
import { computed } from 'vue'
import IconPrevious from '@/components/icons/pagination/IconPrevious.vue'
import IconNext from '@/components/icons/pagination/IconNext.vue'
import { cn } from '@/lib/utils'

const emit = defineEmits(['page-change'])

const props = withDefaults(
  defineProps<{
    currentPage?: number
    totalPages?: number
    maxVisiblePages?: number
    className?: string
  }>(),
  {
    maxVisiblePages: 5,
  }
)

const pages = computed(() => {
  const visiblePages = []
  let startPage = Math.max(
    1,
    props.currentPage - Math.floor(props.maxVisiblePages / 2)
  )
  let endPage = startPage + props.maxVisiblePages - 1

  if (endPage > props.totalPages) {
    endPage = props.totalPages
    startPage = Math.max(1, endPage - props.maxVisiblePages + 1)
  }

  for (let page = startPage; page <= endPage; page++) {
    visiblePages.push(page)
  }

  return visiblePages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}
</script>

<template>
  <div :class="cn('pagination', className)">
    <button
      class="prev body-text flex items-center gap-2 rounded-sm transition-colors hover:!bg-muted disabled:!bg-transparent"
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <IconPrevious />
      {{ $t('Prev') }}
    </button>
    <div class="pages">
      <button
        :class="
          cn(
            'body-text page transition-colors',
            page === currentPage ? 'active' : 'hover:!bg-muted'
          )
        "
        v-for="page in pages"
        :key="page"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>
    <button
      class="next body-text flex items-center gap-2 rounded-sm transition-colors hover:!bg-muted disabled:!bg-transparent"
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      {{ $t('Next') }}
      <IconNext />
    </button>
  </div>
</template>

<style scoped lang="scss">
@import 'scss/pagination';
</style>
