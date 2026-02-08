<script lang="ts" setup>
const { columnName, sortKey, query } = defineProps({
  columnName: {
    type: String,
    required: true,
  },
  sortKey: {
    type: String,
    required: true,
  },
  query: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['sort'])

function handleSortTable(key: string) {
  emit('sort', key)
}
</script>
<template>
  <td
    class="sort"
    :class="{
      asc: query['sort[]'] === '-' + sortKey,
      desc: query['sort[]'] === '+' + sortKey,
    }"
    @click="handleSortTable(sortKey)"
  >
    <p>
      {{ $t(columnName) }}
      <span></span>
    </p>
  </td>
</template>
