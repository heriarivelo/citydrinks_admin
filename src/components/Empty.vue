<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'

defineProps({
  text1: String,
  text2: String,
  link: String,
})
</script>

<template>
  <div class="empty flex h-full flex-col items-center justify-center">
    <p class="body-text">{{ text1 }}</p>
    <p class="body-text">{{ text2 }}</p>
    <UIButton @click="$router.push(link ?? '/')">{{ $t('Create') }}</UIButton>
  </div>
</template>

<style scoped lang="scss">
.empty {
  p {
    margin-bottom: 8px;
  }
  button {
    margin-top: 16px;
  }
}
</style>
