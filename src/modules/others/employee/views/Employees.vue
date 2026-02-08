<script setup lang="ts">
import UITable from '@/components/table/UITable.vue'
import { useEmployeeStore } from '@/modules/others/employee/store/employee.ts'
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoleStore } from '@/modules/others/role/store/role.ts'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIButton from '@/components/ui/UIButton.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { useModalStore } from '@/store/modal.ts'
import MultiSelect from '@/components/ui/selects/MultiSelect.vue'
import StatusSelect from '@/components/ui/selects/StatusSelect.vue'
import { STATUSES } from '@/modules/others/employee/constants.ts'
import { Button, buttonVariants } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { sortTable } from '@/lib/utils'
import UITdSort from '@/components/table/UITdSort.vue'
import { RouterLink } from 'vue-router'
import NoData from '@/components/table/NoData.vue'

const employeeStore = useEmployeeStore()
const roleStore = useRoleStore()
const modalStore = useModalStore()
const { employees, query } = storeToRefs(employeeStore)
const { roles } = storeToRefs(roleStore)
const searchValue = ref('')
const selectedMultiData = ref({
  status: [],
  'roles:name': [],
})

const handleSortTable = async (sortType: string) => {
  sortTable(sortType, query, () => employeeStore.getEmployees())
}

const filterMulti = (e, type) => {
  let index = selectedMultiData.value[type].findIndex((obj) => obj.id === e.id)
  if (index !== -1) {
    selectedMultiData.value[type].splice(index, 1)
  } else {
    selectedMultiData.value[type].push(e)
  }
  if (selectedMultiData.value[type].length) {
    query.value = {
      ...query.value,
      page: 1,
      [type]:
        '[in]' +
        selectedMultiData.value[type]
          .map((item) => (type === 'status' ? item.id : item.name))
          .join(),
    }
  } else {
    delete query.value[type]
  }

  employeeStore.getEmployees()
}

const search = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  searchValue.value = value
  if (value) {
    query.value = {
      ...query.value,
      page: 1,
      all: value,
    }
  } else {
    delete query.value['all']
  }
  employeeStore.getEmployees()
}

const pageChange = (page: number) => {
  query.value.page = page
  employeeStore.getEmployees()
}

onMounted(() => {
  roleStore.getRoles()
  employeeStore.getEmployees()
})

onUnmounted(() => {
  delete query.value['all']
})
</script>

<template>
  <div class="employee flex h-fit min-h-full flex-col gap-[26px]">
    <div class="header flex justify-between">
      <div class="flex gap-4">
        <StatusSelect
          :placeholder="$t('Choose_Status')"
          :data="STATUSES"
          :selected="selectedMultiData['status']"
          @select="filterMulti($event, 'status')"
        />
        <MultiSelect
          :placeholder="$t('Role')"
          :data="roles.data"
          :selected="selectedMultiData['roles:name']"
          @select="filterMulti($event, 'roles:name')"
        />
      </div>
      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/others/employees/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="employeeStore.exportCSV"
          class="text-[var(--neutral-400)]"
        >
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
    <UITable>
      <template v-slot:thead>
        <tr>
          <UITdSort
            :columnName="$t('ID')"
            sortKey="id"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Username')"
            sortKey="user_name"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Role')"
            sortKey="role_id"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Phone_Number')"
            sortKey="phone_number"
            :query="query"
            @sort="handleSortTable"
          />
          <UITdSort
            :columnName="$t('Status')"
            sortKey="status"
            :query="query"
            @sort="handleSortTable"
          />
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr v-if="employees.data?.length" v-for="employee in employees.data">
          <td>{{ employee.id }}</td>
          <td>{{ employee.user_name }}</td>
          <td>{{ employee.role.data.name }}</td>
          <td>{{ employee.phone_number }}</td>
          <td>
            <span class="status" :class="{ active: employee.status == 1 }">
              {{ employee.status == 1 ? 'Active' : 'Deactivated' }}
            </span>
          </td>
          <td class="!py-0">
            <div class="flex justify-center">
              <RouterLink
                :to="`/admin/others/employees/${employee.id}`"
                :class="
                  buttonVariants({
                    variant: 'ghost',
                    size: 'iconMd',
                    class: 'text-[var(--neutral-400)]',
                  })
                "
              >
                <Eye />
              </RouterLink>
              <RouterLink
                :to="`/admin/others/employees/edit/${employee.id}`"
                :class="
                  buttonVariants({
                    variant: 'ghost',
                    size: 'iconMd',
                    class: 'text-[var(--neutral-400)]',
                  })
                "
              >
                <Pencil />
              </RouterLink>
              <Button
                variant="ghost"
                size="iconMd"
                class="text-[var(--neutral-400)]"
                @click="
                  modalStore.setModal({
                    target: 'deleteModal',
                    open: true,
                    data: {
                      header: 'Delete the user',
                      message: 'Are you sure you want to delete this User?',
                      type: 'employee-delete',
                      id: employee?.id,
                    },
                  })
                "
              >
                <Trash2 />
              </Button>
            </div>
          </td>
        </tr>
        <NoData v-else />
      </template>
    </UITable>
    <Pagination
      :currentPage="employees?.meta?.pagination?.current_page"
      :totalPages="employees?.meta?.pagination?.total_pages"
      v-if="employees?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
</template>

<style scoped lang="scss">
.employee {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
