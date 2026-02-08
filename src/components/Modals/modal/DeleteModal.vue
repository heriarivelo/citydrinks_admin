<script setup lang="ts">
import { useModalStore } from '@/store/modal.ts'
import { storeToRefs } from 'pinia'
import UIButton from '@/components/ui/UIButton.vue'
import { useRoleStore } from '@/modules/others/role/store/role.ts'
import { useEmployeeStore } from '@/modules/others/employee/store/employee.ts'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'
import { useRouter } from 'vue-router'
import { TModal } from '@/store/types/modalTypes.ts'
import { useRelatedStore } from '@/modules/others/relatedProduct/store/related.ts'
import { useProductStore } from '@/modules/stocks/products/store/product.ts'
import { useCustomerStore } from '@/modules/sell/customer/store/customer.ts'
import { usePromotionStore } from '@/modules/sell/promotion/store/promotion.ts'
import { useShippingStore } from '@/modules/others/shipping/store/shipping.ts'
import { useBatchStore } from '@/modules/stocks/store/batch'
import { useStockStore } from '@/modules/stocks/store/stock'
import { useQueryClient } from '@tanstack/vue-query'

const modalStore = useModalStore()
const { modal } = storeToRefs(modalStore)
const roleStore = useRoleStore()
const employeeStore = useEmployeeStore()
const providerStore = useProvidersStore()
const relatedStore = useRelatedStore()
const productStore = useProductStore()
const batchStore = useBatchStore()
const stockStore = useStockStore()
const customerStore = useCustomerStore()
const promotionStore = usePromotionStore()
const shippingStore = useShippingStore()
const router = useRouter()
const queryClient = useQueryClient()

const deleteByType = async () => {
  if (modal.value?.data?.type === 'role') {
    await roleStore.actionDeleteRole(modal.value?.data?.id)
    await roleStore.getRoles()
    await router.push('/admin/others/role')
  }
  if (modal.value?.data?.type === 'employee') {
    await employeeStore.actionDeactivateEmployee(modal.value?.data?.data)
    await router.push('/admin/others/employees')
  }
  if (modal.value?.data?.type === 'employee-delete') {
    await employeeStore.actionDeleteById(modal.value?.data?.id)
    await employeeStore.getEmployees()
    await router.push('/admin/others/employees')
  }
  if (modal.value?.data?.type === 'provider') {
    await providerStore.actionDeleteProviders(modal.value?.data?.id)
    await providerStore.actionGetProviders()
    await router.push('/admin/buy/providers')
    queryClient.invalidateQueries({
      queryKey: ['providers'],
    })
  }
  if (modal.value?.data?.type === 'related_product') {
    await relatedStore.actionDeleteRelatedProduct(modal.value?.data?.id)
    await relatedStore.actionGetRelatedProducts()
  }
  if (modal.value?.data?.type === 'product') {
    await productStore.actionDeleteProduct(modal.value?.data?.id)
    await productStore.actionGetProducts()
  }
  if (modal.value?.data?.type === 'batch') {
    await batchStore.actionDeleteBatchItem(modal.value?.data?.id)
    await stockStore.actionGetStockItems(modal.value?.data?.paramId)
  }
  if (modal.value?.data?.type === 'customer') {
    await customerStore.actionDeleteCustomer(modal.value?.data?.id)
    await customerStore.actionGetCustomers()
    queryClient.invalidateQueries({
      queryKey: ['customers'],
    })
  }
  if (modal.value?.data?.type === 'promotion') {
    await promotionStore.actionDeletePromotion(modal.value?.data?.id)
    await promotionStore.actionGetPromotions()
  }
  if (modal.value?.data?.type === 'customer_deactivate') {
    await customerStore.actionDeactivateCustomer(modal.value?.data?.data)
    await router.push('/admin/sell/customers')
    queryClient.invalidateQueries({
      queryKey: ['customers'],
    })
  }
  if (modal.value?.data?.type === 'shipping') {
    await shippingStore.actionDeleteShipping(modal.value?.data?.id)
    await shippingStore.actionGetShippings()
  }
  modalStore.setModal({} as TModal)
}
</script>

<template>
  <div class="delete-content">
    <h1 class="uppercase">{{ modal.data.header }}</h1>
    <div class="text">
      <p class="body-text">{{ modal.data.message }}</p>
    </div>
    <div class="actions flex w-full justify-end gap-4">
      <UIButton
        :types="
          (modal.data.type === 'employee' && modal?.data?.data?.status !== 1) ||
          (modal.data.type === 'customer_deactivate' &&
            modal?.data?.data?.status !== 1)
            ? 'primary'
            : 'warning'
        "
        @click="deleteByType"
        >{{
          modal.data.type === 'employee' ||
          modal.data.type === 'customer_deactivate'
            ? (modal.data.type === 'employee' &&
                modal?.data?.data?.status == 1) ||
              (modal.data.type === 'customer_deactivate' &&
                modal?.data?.data?.status)
              ? $t('Deactivate')
              : $t('Activate')
            : $t('Delete')
        }}
      </UIButton>
      <UIButton types="cancel" @click="modalStore.setModal({} as TModal)">{{
        $t('Cancel')
      }}</UIButton>
    </div>
  </div>
</template>

<style scoped>
.text {
  padding: 12px;
  border: 1px solid var(--neutral-200);
  color: var(--gray-300);
  margin-top: 12px;
  margin-bottom: 24px;
  min-height: 109px;
  min-width: 411px;
}
</style>
