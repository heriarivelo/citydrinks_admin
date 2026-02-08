<script setup lang="ts">
import { watch } from 'vue'
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import IconCancel from '@/components/icons/IconCancel.vue'
import DeleteModal from '@/components/Modals/modal/DeleteModal.vue'
import { TModal } from '@/store/types/modalTypes.ts'
import EditRelatedProduct from '@/components/Modals/modal/EditRelatedProduct.vue'
import CreatStock from '@/components/Modals/modal/CreatStock.vue'
import EditStock from '@/components/Modals/modal/EditStock.vue'
import EditProductReason from '@/components/Modals/modal/EditProductReason.vue'
import RefillModal from '@/components/Modals/modal/RefillModal.vue'
import TransferEdit from '@/components/Modals/modal/TransferEdit.vue'

const modalStore = useModalStore()
const { modal } = storeToRefs(modalStore)

watch(modal, (newVal) => {
  let body = document.getElementsByTagName('body')[0]
  if (newVal.open) {
    body.style.overflow = 'hidden'
  } else {
    body.style.overflow = 'auto'
  }
})
</script>

<template>
  <div class="modal-component" v-if="modal.open" :class="{ open: modal.open }">
    <div class="modal-content">
      <button
        class="close-icon"
        @click="
          modalStore.isFormDirty
            ? modalStore.setIsDialogOpen(true)
            : modalStore.setModal({} as TModal)
        "
      >
        <IconCancel class="cursor-pointer" />
      </button>
      <DeleteModal v-if="modal.target === 'deleteModal'" />
      <EditRelatedProduct v-if="modal.target === 'editRelatedProductModal'" />
      <CreatStock v-if="modal.target === 'createStock'" />
      <EditStock v-if="modal.target === 'editStock'" />
      <EditProductReason v-if="modal.target === 'editProductReason'" />
      <RefillModal v-if="modal.target === 'refillModal'" />
      <TransferEdit v-if="modal.target === 'transferEdit'" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'scss/modal';
</style>
