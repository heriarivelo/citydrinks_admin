<script setup lang="ts">
import { useAdminAuthStore } from '@/store/adminAuth.ts'
import { storeToRefs } from 'pinia'
import IconPersonalInformation from '@/components/icons/IconPersonalInformation.vue'
import IconLogout from '@/components/icons/IconLogout.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const authStore = useAdminAuthStore()
const { me } = storeToRefs(authStore)
const isOpen = ref(false)

const handleNavigate = () => {
  isOpen.value = false
}

const handleLogout = () => {
  isOpen.value = false
  authStore.actionLogOut()
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button class="profile gap-2" variant="ghost">
        <div class="img h2 flex items-center justify-center uppercase">
          {{ me?.first_name?.[0] ?? me?.user_name?.[0] }}
        </div>
        <div class="info">
          <div class="name body-text-2 capitalize">
            {{ me.first_name }} {{ me.last_name }}
          </div>
          <div class="role subtitle text-start">Admin</div>
        </div>
        <ChevronDown class="!size-5 text-primary" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-48 gap-0 p-2">
      <RouterLink
        to="/admin/profile"
        :class="
          buttonVariants({
            variant: 'ghost',
            class: cn(
              'w-full !justify-start !px-2',
              $route.path === '/admin/profile'
                ? 'bg-muted'
                : 'hover:bg-muted/40'
            ),
          })
        "
        @click="handleNavigate"
      >
        <IconPersonalInformation />
        <span class="body-text">{{ $t('My_account') }}</span>
      </RouterLink>
      <Button
        variant="ghost"
        class="w-full justify-start px-2"
        @click="handleLogout"
      >
        <IconLogout />
        <span class="body-text">{{ $t('Log_Out') }}</span>
      </Button>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.profile {
  .img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-500);
    color: var(--white);
  }

  .info {
    .name {
      color: var(--neutral-400);
    }

    .role {
      color: var(--neutral-300);
    }
  }
}
</style>
