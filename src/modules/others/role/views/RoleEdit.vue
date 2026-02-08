<script setup lang="ts">
import CheckboxInput from '@/components/ui/inputs/CheckboxInput.vue'
import { onMounted, ref } from 'vue'
import UIButton from '@/components/ui/UIButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconDelete from '@/components/icons/IconDelete.vue'
import IconCancelFilled from '@/components/icons/IconCancelFilled.vue'
import { useRoleStore } from '@/modules/others/role/store/role.ts'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { TRole } from '@/modules/others/role/store/types/roleTypes.ts'
import { useModalStore } from '@/store/modal'

const orders = ref(false)
const roleStore = useRoleStore()
const { role } = storeToRefs(roleStore)
const modalStore = useModalStore()
const router = useRouter()
const route = useRoute()
const roleForm = ref({
  name: '',
  'permissions[0]': 5,
  'modules[0]': 3,
} as TRole)
const error = ref('')

const submit = async () => {
  const data = await roleStore.actionUpdateRole(roleForm.value)
  if (data.response?.data?.status !== 400) {
    modalStore.setIsFormDirty(false)
    await router.push('/admin/others/role')
  } else {
    Object.keys(data.response.data.errors).forEach((item) => {
      error.value = data.response.data.errors[item][0]
    })
  }
}

onMounted(async () => {
  await roleStore.actionCreateRoleById(Number(route.params.id))
  roleForm.value = { ...roleForm.value, ...role.value }
})
</script>

<template>
  <div class="role-create flex w-full flex-col gap-[18px]">
    <h2 class="uppercase">{{ $t('Edit_Role') }}</h2>
    <form class="role-form" @submit.prevent="submit">
      <div class="role-header flex items-center justify-between">
        <input class="h2" placeholder="Role" v-model="roleForm.name" />
        <div class="role-actions flex gap-4">
          <IconEdit class="cursor-pointer" />
          <IconDelete class="cursor-pointer" />
        </div>
        <span class="error-text body-text" v-if="error">{{ error }}</span>
      </div>
      <div class="role-content">
        <div class="role-selected content-item flex gap-2">
          <div class="selected-item chip flex items-center gap-2.5">
            test
            <IconCancelFilled class="cursor-pointer" />
          </div>
        </div>
        <div class="content-item">
          <CheckboxInput v-model="orders">{{ $t('Orders') }}</CheckboxInput>
        </div>
      </div>
      <div class="action flex w-full justify-end">
        <UIButton>{{ $t('Save') }}</UIButton>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@import 'scss/role-form';

.role-create {
  padding: 24px 32px;
}
.error-text {
  padding: 4px 10px;
  color: var(--white);
  background: var(--warning-400);
  border-radius: 4px;
  position: absolute;
  width: 100%;
  left: 0;
  bottom: calc(100% + 14px);
  z-index: 1;

  &:before {
    content: '';
    position: absolute;
    bottom: -17px;
    left: 8px;
    transform: translateY(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 12px solid var(--warning-400);
  }
}
</style>
