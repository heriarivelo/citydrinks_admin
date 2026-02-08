<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import Header from '@/components/Header/Header.vue'
import Modal from '@/components/Modals/Modal.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useNotificationStore } from '@/store/notification'

const notificationStore = useNotificationStore()
</script>

<template>
  <div class="admin-layout">
    <Header />
    <Sidebar />
    <Spinner :is-spinning="notificationStore.isLoading" />
    <div class="main">
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
  <Modal />
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 238px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    'sidebar header'
    'sidebar main';
  height: 100vh;
  width: 100vw;
  background: var(--neutral-100);
  overflow: hidden;

  .sidebar {
    grid-area: sidebar;
  }

  .header {
    grid-area: header;
  }

  .main {
    grid-area: main;
    padding: 24px 32px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: var(--neutral-300);
      border: 3px solid var(--white);
      background-clip: padding-box;
      border-radius: 9999px;
    }
    .content {
      min-width: 1233px;
      background: var(--white);
      width: 100%;
      height: calc(100vh - 124px);
      border-radius: 4px;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 9px;
      }

      /* Handle */
      &::-webkit-scrollbar-thumb {
        background: var(--neutral-300);
        border: 3px solid var(--white);
        background-clip: padding-box;
        border-radius: 9999px;
      }
    }
  }
}
</style>
