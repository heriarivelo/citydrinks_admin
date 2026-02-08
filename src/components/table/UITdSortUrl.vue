<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { columnName, sortKey } = defineProps({
  columnName: {
    type: String,
    required: true,
  },
  sortKey: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['sort'])

function handleSortTable(key: string) {
  const currentSort = route.query['sort[]']
  let newSort = `+${key}`
  if (currentSort === `+${key}`) {
    newSort = `-${key}`
  } else if (currentSort === `-${key}`) {
    newSort = null
  }
  const newQuery = { ...route.query }
  if (newSort) {
    newQuery['sort[]'] = newSort
  } else {
    delete newQuery['sort[]']
  }
  router.push({ query: newQuery })
  emit('sort', newSort)
}
</script>

<template>
  <td
    class="sort"
    :class="{
      asc: route.query['sort[]'] === '-' + sortKey,
      desc: route.query['sort[]'] === '+' + sortKey,
    }"
    @click="handleSortTable(sortKey)"
  >
    <p>
      {{ $t(columnName) }}
      <span></span>
    </p>
  </td>
</template>
