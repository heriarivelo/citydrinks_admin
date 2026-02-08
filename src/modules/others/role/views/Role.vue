<script setup lang="ts">
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIButton from '@/components/ui/UIButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconDelete from '@/components/icons/IconDelete.vue'
import { onMounted, ref } from 'vue'
import { useRoleStore } from '@/modules/others/role/store/role.ts'
import { storeToRefs } from 'pinia'
import CheckboxInput from '@/components/ui/inputs/CheckboxInput.vue'
import { useModalStore } from '@/store/modal.ts'
import Pagination from '@/components/ui/Pagination.vue'

const rolesStore = useRoleStore()
const modalStore = useModalStore()
const { roles, query } = storeToRefs(rolesStore)
const orders = ref({})
const selected = ref({})
const rolesData = ref([])

const filter = (e) => {
  query.value = {
    ...query.value,
    page: 1,
    name: e.name,
  }
  selected.value = e
  rolesStore.getRoles()
}

const pageChange = (page) => {
  query.value.page = page
  rolesStore.getRoles()
}

onMounted(async () => {
  await rolesStore.getRoles()
  rolesData.value = JSON.parse(JSON.stringify(roles.value?.data))
})
</script>

<template>
  <div class="role flex flex-col gap-[18px]">
    <div class="header flex items-center justify-between">
      <SingleSelect
        :placeholder="$t('Choose_a_role')"
        :data="rolesData"
        :selected="selected"
        @select="filter"
      />
      <UIButton @click="$router.push('/admin/others/roles/create')">{{
        $t('Create_Role')
      }}</UIButton>
    </div>

    <div class="roles-list flex flex-col gap-4">
      <div class="role-form" v-for="role in roles.data">
        <div class="role-header flex items-center justify-between">
          <h2>{{ role.name }}</h2>
          <div class="role-actions flex gap-4">
            <IconEdit
              class="cursor-pointer"
              @click="$router.push(`/admin/others/roles/edit/${role?.id}`)"
            />
            <IconDelete
              class="cursor-pointer"
              @click="
                modalStore.setModal({
                  target: 'deleteModal',
                  open: true,
                  data: {
                    header: $t('Delete_role'),
                    message: $t('Delete_role_text'),
                    type: 'role',
                    id: role.id,
                  },
                })
              "
            />
          </div>
        </div>
        <div class="role-content">
          <div class="content-item">
            <CheckboxInput v-model="orders[role.name]">{{
              $t('Orders')
            }}</CheckboxInput>
          </div>
        </div>
      </div>
    </div>

    <Pagination
      :currentPage="roles?.meta?.pagination?.current_page"
      :totalPages="roles?.meta?.pagination?.total_pages"
      v-if="roles?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
</template>

<style scoped lang="scss">
@import 'scss/role-form';

.role {
  padding: 24px 32px;
}
</style>
