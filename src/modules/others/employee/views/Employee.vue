<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import { useModuleStore } from '@/modules/others/employee/store/module.ts'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useEmployeeStore } from '@/modules/others/employee/store/employee.ts'
import { useRoute } from 'vue-router'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { useModalStore } from '@/store/modal.ts'

const moduleStore = useModuleStore()
const { modules } = storeToRefs(moduleStore)
const employeeStore = useEmployeeStore()
const modalStore = useModalStore()
const { employee } = storeToRefs(employeeStore)
const route = useRoute()

onMounted(async () => {
  await moduleStore.getModules()
  await employeeStore.actionGetEmployeeById(Number(route.params.id))
})
</script>

<template>
  <div class="employee flex flex-col items-center">
    <div class="header-button">
      <UIButton
        types="cancel"
        @click="$router.push('/admin/others/employees')"
        >{{ $t('Go_Back') }}</UIButton
      >
    </div>
    <div class="card">
      <div class="header flex gap-8">
        <div class="name flex justify-center">
          {{ employee?.first_name?.[0] ?? employee?.user_name?.[0] }}
        </div>
        <div class="info flex flex-col gap-2">
          <div class="info-item flex gap-2">
            <h3>UserName:</h3>
            <p class="body-text">qwe</p>
          </div>
          <div class="info-item flex gap-2">
            <h3>UserName:</h3>
            <p class="body-text">qwe</p>
          </div>
          <div class="info-item flex gap-2">
            <h3>Status:</h3>
            <p class="body-text">qwe</p>
          </div>
        </div>
      </div>
      <div class="forms flex flex-col gap-4">
        <div class="flex gap-5">
          <UIInput
            v-model="employee.phone_number"
            :disabled="true"
            placeholder="Phone Number"
            class="w-full"
          />
        </div>
        <UIInput
          :input-type="'email'"
          v-model="employee.email"
          :disabled="true"
          placeholder="Email"
          class="w-full"
        />
      </div>
      <div class="action flex justify-end">
        <UIButton
          :types="employee.status == 1 ? 'warning' : 'primary'"
          @click="
            modalStore.setModal({
              target: 'deleteModal',
              open: true,
              data: {
                header:
                  employee.status == 1
                    ? $t('DeActivate_user')
                    : $t('Activate_user'),
                message:
                  employee.status == 1
                    ? $t('DeActivate_user_text')
                    : $t('Activate_user_text'),
                type: 'employee',
                data: employee,
              },
            })
          "
          >{{ employee.status == 1 ? $t('Deactivate') : $t('Activate') }}
        </UIButton>
      </div>
    </div>
    <div class="permissions flex flex-col">
      <h2>Permissions</h2>
      <div class="permissions-content">
        <div class="permission-header">
          <h2>{{ employee?.role?.data?.name ?? 'test' }}</h2>
        </div>
        <div class="permission-row flex" v-for="module in modules?.data">
          <div class="permission-name permission-item body-text">
            {{ module?.name }}
          </div>
          <div class="permission-item">
            <span
              class="chip"
              v-for="permission in module?.permissions?.data"
              >{{ permission?.name?.split('_')[1] }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee {
  padding: 32px;

  .header-button {
    margin-right: auto;
  }

  .card {
    margin-bottom: 50px;
    margin-top: 32px;
    border-radius: 8px;
    padding: 48px;
    border: 1px solid var(--gray-200);
    min-width: 508px;
    max-width: 508px;

    .header {
      .name {
        font-size: 80px;
        font-weight: 600;
        color: var(--primary-700);
        text-transform: uppercase;
        background: var(--primary-200);
        width: 84px;
        height: 84px;
        line-height: 71px;
        border-radius: 8px;
      }
    }

    .forms {
      margin-top: 32px;
      margin-bottom: 24px;
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
      width: 100%;
      border-bottom: 1px solid var(--neutral-300);
      border-left: 1px solid var(--neutral-300);

      &:last-child {
        border-right: 1px solid var(--neutral-300);
      }

      span {
        padding: 3px 22px;
        margin-right: 8px;
        background: var(--neutral-100);
        border-radius: 100px;
      }
    }

    .permission-name {
      width: 100%;
    }
  }
}
</style>
