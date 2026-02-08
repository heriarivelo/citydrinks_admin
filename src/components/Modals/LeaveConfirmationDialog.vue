<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModalStore } from '@/store/modal'
import { TModal } from '@/store/types/modalTypes'
import { TriangleAlert } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const modalStore = useModalStore()
const router = useRouter()

const handleConfirm = async () => {
  if (modalStore.isFormDialog) {
    modalStore.setIsFormDirty(false)
    modalStore.setIsDialogOpen(false)
    modalStore.isFormDialog = false
    modalStore.setModal({} as TModal)
    return
  }

  if (modalStore.targetRoute) {
    try {
      modalStore.setIsFormDirty(false)
      if (
        typeof modalStore.targetRoute === 'string' ||
        (modalStore.targetRoute &&
          typeof modalStore.targetRoute.path === 'string')
      ) {
        if (
          typeof modalStore.targetRoute === 'object' &&
          modalStore.targetRoute !== null
        ) {
          await router.push({
            ...modalStore.targetRoute,
            path:
              typeof modalStore.targetRoute.path === 'string'
                ? modalStore.targetRoute.path
                : undefined,
          })
        }
      }
      modalStore.setIsDialogOpen(false)
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }
}

const handleCancel = () => {
  modalStore.setIsDialogOpen(false)
}
</script>

<template>
  <Dialog
    :open="modalStore.isDialogOpen"
    @update:open="modalStore.setIsDialogOpen"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('QUIT!') }}</DialogTitle>
        <DialogDescription
          class="flex gap-2.5 rounded-md border border-secondary py-2 pe-4 ps-3"
        >
          <TriangleAlert
            class="mt-1 shrink-0 text-secondary"
            stroke-width="2.5"
          />
          <span class="text-start text-lg">
            Are you sure you want to quit? <br />
            All unsaved changes will be lost.
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button class="w-[6.375rem]" @click="handleConfirm"> Yes </Button>
        <Button variant="outline" class="w-[6.375rem]" @click="handleCancel">
          No
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
