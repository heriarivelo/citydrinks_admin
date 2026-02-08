<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { useModalStore } from '@/store/modal.ts'
import { useCustomerStore } from '@/modules/sell/customer/store/customer.ts'

const customerStore = useCustomerStore()
const modalStore = useModalStore()
const { customer } = storeToRefs(customerStore)
const route = useRoute()

onMounted(async () => {
  await customerStore.actionGetCustomerById(Number(route.params.id))
})
</script>

<template>
  <div class="customer flex flex-col items-center">
    <div class="header-button">
      <UIButton types="cancel" @click="$router.push('/admin/sell/customers')">{{
        $t('Go_Back')
      }}</UIButton>
    </div>
    <div class="card">
      <div class="header flex gap-8">
        <div class="name flex justify-center">
          {{ customer?.first_name?.[0] ?? customer?.user_name?.[0] }}
        </div>
        <div class="info flex flex-col gap-2">
          <div class="info-item flex gap-2">
            <h3>Username:</h3>
            <p class="body-text">{{ customer.user_name }}</p>
          </div>
          <div class="info-item flex gap-2">
            <h3>Name:</h3>
            <p class="body-text">
              {{ customer.first_name }}{{ ' '
              }}<span v-if="customer.last_name"> {{ customer.last_name }}</span>
            </p>
          </div>
          <div class="info-item flex gap-2">
            <h3>Status:</h3>
            <p class="body-text">
              {{ customer.status ? $t('Active') : $t('Inactive') }}
            </p>
          </div>
        </div>
      </div>
      <div class="forms flex flex-col gap-4">
        <div class="flex gap-5">
          <UIInput
            v-model="customer.company"
            :disabled="true"
            placeholder="Company"
            class="w-full"
          />
          <UIInput
            v-model="customer.phone"
            :disabled="true"
            placeholder="Phone Number"
            class="w-full"
          />
        </div>
        <UIInput
          v-model="customer.address"
          :disabled="true"
          placeholder="Address"
          class="w-full"
        />
        <UIInput
          v-model="customer.email"
          :input-type="'email'"
          :disabled="true"
          placeholder="Email"
          class="w-full"
        />
      </div>
      <div class="action flex justify-end">
        <UIButton
          :types="customer.status ? 'warning' : 'primary'"
          @click="
            modalStore.setModal({
              target: 'deleteModal',
              open: true,
              data: {
                header: customer.status
                  ? $t('DeActivate_user')
                  : $t('Activate_user'),
                message: customer.status
                  ? $t('DeActivate_user_text')
                  : $t('Activate_user_text'),
                type: 'customer_deactivate',
                data: customer,
              },
            })
          "
          >{{ customer.status ? $t('Deactivate') : $t('Activate') }}
        </UIButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer {
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
        line-height: 90px;
        border-radius: 8px;
      }
    }

    .forms {
      margin-top: 32px;
      margin-bottom: 24px;
    }
  }
}
</style>
