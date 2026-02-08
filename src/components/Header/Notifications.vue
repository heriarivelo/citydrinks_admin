<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-vue-next'
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    class="relative border-border/30 text-primary"
  >
    <span
      class="absolute right-0 top-0 me-0.5 mt-0.5 size-2 rounded-full bg-destructive"
    />
    <Bell />
  </Button>
</template>
