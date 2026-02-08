<script setup lang="ts">
import UIButton from '@/components/ui/UIButton.vue'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import { useProvidersStore } from '@/modules/buy/providers/store/provider.ts'

const providersStore = useProvidersStore()
const { provider } = storeToRefs(providersStore)
const route = useRoute()

onMounted(async () => {
  await providersStore.actionGetProviderById(Number(route.params.id))
})
</script>

<template>
  <div class="provider flex flex-col items-center">
    <div class="header-button">
      <UIButton types="cancel" @click="$router.push('/admin/buy/providers')">{{
        $t('Go_Back')
      }}</UIButton>
    </div>
    <div class="card">
      <div class="header flex gap-8">
        <div class="name flex justify-center">
          {{ provider?.first_name?.[0] ?? provider?.user_name?.[0] }}
        </div>
        <div class="info flex flex-col gap-2">
          <div class="info-item flex gap-2">
            <h3>{{ $t('Username') }}:</h3>
            <p class="body-text">{{ provider.user_name }}</p>
          </div>
          <div class="info-item flex gap-2">
            <h3>{{ $t('Name') }}:</h3>
            <p class="body-text">
              {{ provider.first_name }}{{ ' ' }}
              <span v-if="provider.last_name"> {{ provider.last_name }}</span>
            </p>
          </div>
          <div
            class="info-item flex gap-2"
            v-if="provider.status !== undefined"
          >
            <h3>{{ $t('Status') }}:</h3>
            <p class="body-text">
              {{ provider.status ? $t('Active') : $t('Inactive') }}
            </p>
          </div>
        </div>
      </div>
      <div class="forms flex flex-col gap-4">
        <div class="flex gap-5">
          <UIInput
            :model-value="provider?.company"
            :disabled="true"
            :placeholder="$t('Company')"
            class="w-full"
          />
          <UIInput
            :model-value="provider?.phone_number"
            :disabled="true"
            :placeholder="$t('Phone_Number')"
            class="w-full"
          />
        </div>
        <UIInput
          :model-value="provider?.address"
          :disabled="true"
          :placeholder="$t('Address')"
          class="w-full"
        />
        <UIInput
          :model-value="provider?.email"
          :input-type="'email'"
          :disabled="true"
          :placeholder="$t('Email')"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.provider {
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
