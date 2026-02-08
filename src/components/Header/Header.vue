<script setup lang="ts">
import LanguagesDropdown from '@/components/Header/LanguagesDropdown.vue'
import Notifications from '@/components/Header/Notifications.vue'
import Profile from '@/components/Header/Profile.vue'
import { useHeaderStore } from '@/store/headerStore.ts'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

const headerStore = useHeaderStore()
const { headerData } = storeToRefs(headerStore)
</script>

<template>
  <div class="header z-20 flex items-center justify-between">
    <h2>
      {{ $t(headerData.h2 ? headerData.h2 : String($route?.meta?.h2)) }}
      <span v-if="headerData.span || $route?.meta?.span"
        >/
        {{
          headerData.span
            ? headerData.span
            : $route?.meta?.span
              ? $t(String($route.meta.span))
              : ''
        }}
        <span v-if="headerData.span2 || $route?.meta?.span2"
          >/
          {{
            headerData.span2
              ? headerData.span2
              : $route?.meta?.span2
                ? $t(String($route.meta.span2))
                : ''
          }}
        </span>
      </span>
    </h2>
    <div class="header-actions flex items-center gap-2">
      <LanguagesDropdown />
      <Notifications />
      <Profile />
    </div>
  </div>
</template>

<style scoped>
@import 'scss/header.scss';
</style>
