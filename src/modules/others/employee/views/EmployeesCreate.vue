<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { onMounted, ref } from 'vue'
import { useRoleStore } from '@/modules/others/role/store/role.ts'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '@/modules/others/employee/store/employee.ts'
import { useModuleStore } from '@/modules/others/employee/store/module.ts'
import CheckboxInput from '@/components/ui/inputs/CheckboxInput.vue'
import { useRouter } from 'vue-router'
import { TEmployeeErrors } from '@/modules/others/employee/store/types/employeeTypes.ts'
import { TRole } from '@/modules/others/role/store/types/roleTypes.ts'
import { useModalStore } from '@/store/modal'

const roleStore = useRoleStore()
const employeeStore = useEmployeeStore()
const moduleStore = useModuleStore()
const { roles } = storeToRefs(roleStore)
const { modules } = storeToRefs(moduleStore)
const selectedRole = ref({} as TRole)
const router = useRouter()

const employeeInit = {
  role_id: '',
  user_name: '',
  email: '',
  phone_number: '',
  first_name: '',
  last_name: '',
}

const errors = ref({} as TEmployeeErrors)
const modalStore = useModalStore()
const employeeForm = ref(JSON.parse(JSON.stringify(employeeInit)))

const selectRole = (role: TRole) => {
  selectedRole.value = role
  employeeForm.value.role_id = role.id
}

const submit = async () => {
  errors.value = {} as TEmployeeErrors
  const data = await employeeStore.createEmployee(employeeForm.value)
  if (data.status == 201) {
    employeeForm.value = JSON.parse(JSON.stringify(employeeInit))
    selectedRole.value = {} as TRole
    modalStore.setIsFormDirty(false)
    await router.push('/admin/others/employees')
  } else {
    Object.keys(data.response.data.errors).forEach((item, index) => {
      if (index == 0) {
        errors.value[item] = data.response.data.errors[item][0]
      }
    })
  }
}

onMounted(() => {
  roleStore.getRoles()
  moduleStore.getModules()
})
</script>

<template>
  <div class="employee flex justify-center">
    <div class="form-content">
      <h1 class="uppercase">{{ $t('Create_Employee') }}</h1>
      <form class="flex flex-col gap-[50px]" @submit.prevent="submit">
        <div class="content gap-x-6 gap-y-4">
          <SingleSelect
            :error="errors.role_id"
            :data="roles?.data"
            @select="selectRole"
            :selected="selectedRole"
            placeholder="Choose a role*"
            :is-dirty="true"
            :none="false"
          />
          <UIInput
            @update:model-value="errors = {} as TEmployeeErrors"
            :error="errors.user_name"
            :placeholder="`${$t('Username')} *`"
            v-model="employeeForm.user_name"
          />
          <UIInput
            @update:model-value="errors = {} as TEmployeeErrors"
            :input-type="'email'"
            :error="errors.email"
            :placeholder="`${$t('Email')} *`"
            v-model="employeeForm.email"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TEmployeeErrors"
            :error="errors.phone_number"
            :placeholder="`${$t('Phone_Number')} *`"
            v-model="employeeForm.phone_number"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TEmployeeErrors"
            :error="errors.first_name"
            :placeholder="$t('First_Name')"
            v-model="employeeForm.first_name"
            :is-dirty="true"
          />
          <UIInput
            @update:model-value="errors = {} as TEmployeeErrors"
            :error="errors.last_name"
            :placeholder="$t('Last_Name')"
            v-model="employeeForm.last_name"
            :is-dirty="true"
          />
        </div>
        <div class="permissions flex flex-col" v-if="selectedRole?.name">
          <h2>Permissions</h2>
          <div class="permissions-content">
            <div class="permission-header">
              <h2>{{ selectedRole?.name }}</h2>
            </div>
            <div class="permission-row flex" v-for="module in modules?.data">
              <div class="permission-name permission-item">
                <CheckboxInput>{{ module?.name }}</CheckboxInput>
              </div>
              <div
                class="permission-item"
                v-for="permission in module?.permissions?.data"
              >
                <CheckboxInput>{{
                  permission?.name?.split('_')[1]
                }}</CheckboxInput>
              </div>
            </div>
          </div>
        </div>
        <div class="actions flex w-full justify-end gap-4">
          <UIButton>{{ $t('Create') }}</UIButton>
          <UIButton
            type="button"
            types="cancel"
            @click="$router.push('/admin/others/employees')"
            >{{ $t('Go_Back') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.employee {
  padding: 32px;

  .form-content {
    margin-top: 50px;

    h1 {
      margin-bottom: 24px;
      text-align: center;
    }

    form {
      .content {
        max-width: 678px;
        min-width: 678px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        margin: auto;
      }
    }
  }
}

.permissions {
  width: 1074px;

  .permissions-content {
    margin-top: 25px;
  }

  .permission-header {
    border-radius: 4px 4px 0 0;
    background: var(--neutral-200);
    padding: 12px 24px;
  }

  .permission-row {
    .permission-item {
      padding: 11px 23px;
      max-width: 169px;
      min-width: 169px;
      border-bottom: 1px solid var(--neutral-300);
      border-left: 1px solid var(--neutral-300);

      &:last-child {
        border-right: 1px solid var(--neutral-300);
      }
    }

    .permission-name {
      max-width: 398px;
      min-width: 398px;
    }
  }
}
</style>
