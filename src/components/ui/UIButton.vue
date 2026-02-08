<script setup lang="ts">
withDefaults(
  defineProps<{
    types?: 'primary' | 'cancel' | 'warning'
    disabled?: boolean
  }>(),
  {
    types: 'primary',
  }
)
</script>

<template>
  <button class="body-text" :class="[types]" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped lang="scss">
button {
  padding: 8px 26px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background 250ms;
  &:focus-visible {
    outline: none;
  }
}

.primary {
  background: var(--primary-500);
  color: var(--white);
  border: 1px solid var(--primary-500);
  &:hover {
    background: var(--primary-400);
    border: 1px solid var(--primary-400);
  }
  &:disabled {
    background: var(--primary-200);
    border: 1px solid var(--primary-200);
    cursor: not-allowed;
  }
}

.cancel {
  background: none;
  color: var(--gray-300);
  border: 1px solid var(--gray-200);
  &:hover {
    background: hsl(var(--muted));
    color: var(--gray-300);
    border: 1px solid var(--gray-300);
  }
  &:disabled {
    background: none;
    color: var(--gray-200);
    border: 1px solid var(--gray-200);
  }
}

.warning {
  background: var(--warning-500);
  color: var(--white);
  border: 1px solid var(--warning-500);
  &:hover {
    background: var(--warning-600);
    border: 1px solid var(--warning-600);
  }
  &:disabled {
    background: var(--warning-300);
    border: 1px solid var(--warning-300);
    cursor: not-allowed;
  }
}
</style>
