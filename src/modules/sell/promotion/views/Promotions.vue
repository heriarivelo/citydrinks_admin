<script setup lang="ts">
import Empty from '@/components/Empty.vue'
import NoData from '@/components/table/NoData.vue'
import UITable from '@/components/table/UITable.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UIButton from '@/components/ui/UIButton.vue'
import { Button, buttonVariants } from '@/components/ui/button'
import UIInput from '@/components/ui/inputs/UIInput.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'
import { usePromotionStore } from '@/modules/sell/promotion/store/promotion.ts'
import { useModalStore } from '@/store/modal.ts'
import dayjs from '@/lib/dayjs'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const promotionStore = usePromotionStore()
const modalStore = useModalStore()
const loaded = ref(false)
const { promotions, query } = storeToRefs(promotionStore)
const searchValue = ref('')
const chooseDuration = ref('')

const timer = ref(null)

const search = async (event: Event) => {
  clearTimeout(timer.value)
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
  loaded.value = false
  timer.value = setTimeout(async () => {
    await promotionStore.actionGetPromotions()
    loaded.value = true
  }, 300)
}

const updateDate = async (event: any) => {
  chooseDuration.value = event.split(',').join(' to ')
  if (event) {
    query.value = {
      ...query.value,
      page: 1,
      start_date: '[between]' + event,
    }
  } else {
    delete query.value['start_date']
    query.value = {
      ...query.value,
      page: 1,
    }
  }
  loaded.value = false
  await promotionStore.actionGetPromotions()
  loaded.value = true
}

const pageChange = (page: number) => {
  query.value.page = page
  promotionStore.actionGetPromotions()
}

onMounted(async () => {
  promotionStore.$reset()
  await promotionStore.actionGetPromotions()
  loaded.value = true
})

onUnmounted(() => {
  delete query.value['all']
})
</script>

<template>
  <div
    v-if="
      promotions?.data?.length ||
      !loaded ||
      query?.['all'] ||
      query?.['start_date']
    "
    class="promotions flex h-full flex-col gap-[26px]"
  >
    <div class="header flex justify-between">
      <UIInputDate
        mode="range"
        :placeholder="$t('Choose_duration')"
        @update:model-value="updateDate"
        :model-value="chooseDuration"
      />

      <div class="flex gap-2">
        <UIInput
          icon="search"
          v-model="searchValue"
          :placeholder="$t('Search')"
          @input="search"
        />
        <UIButton @click="$router.push('/admin/sell/promotion/create')">{{
          $t('Create')
        }}</UIButton>
        <Button
          variant="ghost"
          @click="promotionStore.exportCSV"
          class="text-[var(--neutral-400)]"
        >
          {{ $t('Export_csv') }}
        </Button>
      </div>
    </div>
    <UITable>
      <template v-slot:thead>
        <tr>
          <td>{{ $t('ID') }}</td>
          <td>{{ $t('Promotion') }}</td>
          <td>{{ $t('Start_date') }}</td>
          <td>{{ $t('End_date') }}</td>
          <td>{{ $t('Status') }}</td>
          <td>{{ $t('Actions') }}</td>
        </tr>
      </template>
      <template v-slot:t-row>
        <tr v-if="promotions.data?.length" v-for="product in promotions.data">
          <td>{{ product?.id }}</td>
          <td>{{ product?.name }}</td>
          <td>{{ product?.start_date }}</td>
          <td>{{ product?.end_date }}</td>
          <td>
            {{
              dayjs(product?.end_date, 'DD-MM-YYYY').isBefore(dayjs())
                ? $t('Past')
                : $t('Current')
            }}
          </td>
          <td class="!py-0">
            <div class="flex justify-center">
              <RouterLink
                :to="`/admin/sell/promotion/${product.id}`"
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
              <Button
                variant="ghost"
                size="iconMd"
                class="text-[var(--neutral-400)]"
                @click="
                  modalStore.setModal({
                    target: 'deleteModal',
                    open: true,
                    data: {
                      header: $t('Delete_promotion'),
                      message: $t('Delete_promotion_text'),
                      type: 'promotion',
                      id: product?.id,
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
      :currentPage="promotions?.meta?.pagination?.current_page"
      :totalPages="promotions?.meta?.pagination?.total_pages"
      v-if="promotions?.meta?.pagination?.total_pages > 1"
      @page-change="pageChange"
    />
  </div>
  <Empty
    v-else
    :text1="$t('Empty_Promotion1')"
    :text2="$t('Empty_Promotion2')"
    link="/admin/sell/promotion/create"
  />
</template>

<style scoped>
.promotions {
  padding: 32px;

  .export {
    background: none;
    border: none;
    margin-top: auto;
  }
}
</style>
