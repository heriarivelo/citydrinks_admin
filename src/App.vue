<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import { useNotificationStore } from '@/store/notification.ts'
import { storeToRefs } from 'pinia'
import IconCancel from '@/components/icons/IconCancel.vue'
import LeaveConfirmationDialog from './components/Modals/LeaveConfirmationDialog.vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

const authStore = useAdminAuthStore()
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

onBeforeMount(async () => {
  if (localStorage.token) {
    await init()
  }
})

const init = async () => {
  try {
    await authStore.actionGetMe()
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <RouterView />
  <LeaveConfirmationDialog />
  <div class="notification">
    <div
      class="notification-item body-text flex justify-between"
      :class="{ [notification.type]: notification }"
      v-for="notification in notifications"
    >
      {{ notification.notification }}
      <IconCancel
        class="cursor-pointer"
        @click="notificationStore.removeNotification(notification.id)"
      />
    </div>
  </div>
  <VueQueryDevtools />
</template>

<style scoped lang="scss">
.notification {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 335px;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  z-index: 2000;
  .notification-item {
    width: 335px;
    border-radius: 4px;
    box-shadow: 0 3px 11px 0 #00000033;
    padding: 10px;
    animation: slideLeft 0.5s linear forwards;
    position: relative;
    right: 0;

    &.success {
      background: var(--success-400);
      color: var(--white);
    }
    &.warning {
      background: var(--warning-400);
      color: var(--white);
    }
  }

  @keyframes slideLeft {
    0% {
      right: -355px;
    }
    100% {
      right: 0;
    }
  }
}
</style>
