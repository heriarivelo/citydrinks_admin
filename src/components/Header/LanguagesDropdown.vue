<script setup lang="ts">
import IconUSFlag from '@/components/icons/IconUSFlag.vue'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-vue-next'
</script>

<template>
  <Button variant="outline" class="relative me-2 h-9 border-border/30 px-2">
    <IconUSFlag />
    <ChevronDown class="text-border" />
  </Button>
</template>
