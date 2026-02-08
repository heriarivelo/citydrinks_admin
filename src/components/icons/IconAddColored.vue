<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string
  }>(),
  {
    type: 'primary',
  }
)
</script>

<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="10"
      r="10"
      :fill="type === 'primary' ? 'var(--primary-500)' : 'var(--success-500)'"
    />
    <path
      d="M10 4V16M16 10H4"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped></style>
