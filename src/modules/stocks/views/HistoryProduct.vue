<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchStockMovements } from '@/api/stockMovements'
import axiosClient from '@/utils/axiosClient'

import SingleSelect from '@/components/ui/selects/SingleSelect.vue'
import UIInputDate from '@/components/ui/inputs/UIInputDate.vue'

import ScrollContainer from '@/components/table/ScrollContainer.vue'
import UITable from '@/components/table/UITable.vue'
import NoData from '@/components/table/NoData.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const goToOrder = (order: any) => {
  if (!order?.id) return

  // ✅ adapte juste ce path à ta route front réelle
  router.push(`/admin/sell/orders/${order.id}`)
}

const filters = ref({
  product_id: undefined as number | undefined,
  stock_id: undefined as number | undefined,
  type: undefined as 'in' | 'out' | undefined,
  start_date: undefined as string | undefined,
  end_date: undefined as string | undefined,
  per_page: 50,
})

const page = ref(1)

const loading = ref(false)
const rows = ref<any[]>([])
const meta = ref<any>(null)

const products = ref<any[]>([])
const stocks = ref<any[]>([])

const params = computed(() => {
  const p: Record<string, any> = { ...filters.value, page: page.value }

  // enlève les undefined / '' / null
  Object.keys(p).forEach((k) => {
    if (p[k] === undefined || p[k] === '' || p[k] === null) delete p[k]
  })

  return p
})


const selectedProduct = computed(() =>
  filters.value.product_id
    ? products.value.find((p) => p.id === filters.value.product_id) ?? {}
    : {}
)

const selectedStock = computed(() =>
  filters.value.stock_id
    ? stocks.value.find((s) => s.id === filters.value.stock_id) ?? {}
    : {}
)

const selectedType = computed(() => {
  if (!filters.value.type) return {}
  return filters.value.type === 'in'
    ? { id: 'in', name: 'Entrée' }
    : { id: 'out', name: 'Sortie' }
})

const typeOptions = [
  { id: 'in', name: 'Entrée' },
  { id: 'out', name: 'Sortie' },
]

const displayStartDate = computed(() => filters.value.start_date ?? '')
const displayEndDate = computed(() => filters.value.end_date ?? '')

const updateStartDate = (v: string) => {
  filters.value.start_date = v || undefined
}

const updateEndDate = (v: string) => {
  filters.value.end_date = v || undefined
}

const onSelectProduct = (p: any) => {
  filters.value.product_id = p?.id ? Number(p.id) : undefined
}

const onSelectStock = (s: any) => {
  filters.value.stock_id = s?.id ? Number(s.id) : undefined
}

const onSelectType = (t: any) => {
  filters.value.type = t?.id ? (t.id as 'in' | 'out') : undefined
}

const asArray = (payload: any) => {
  // cas 1: response pagination Laravel { data: [...], meta: ... }
  if (Array.isArray(payload?.data)) return payload.data
  // cas 2: parfois { data: { data: [...] } }
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  // cas 3: direct array
  if (Array.isArray(payload)) return payload
  return []
}

const loadRefs = async () => {
  try {
    const [p, s] = await Promise.all([
      axiosClient.get('/admin/products', { params: { per_page: 500 } }),
      axiosClient.get('/admin/stocks', { params: { per_page: 500 } }),
    ])

    products.value = asArray(p.data)
    stocks.value = asArray(s.data)
  } catch (e) {
    console.error('loadRefs failed', e)
    products.value = []
    stocks.value = []
  }
}


const load = async () => {
  loading.value = true
  try {
    const res = await fetchStockMovements(params.value)
    rows.value = res.data ?? []
    meta.value = res.meta ?? null
  } finally {
    loading.value = false
  }
}

// reset page uniquement quand un filtre change
watch(filters, () => {
  page.value = 1
  load()
}, { deep: true })

// recharger quand on change de page
watch(page, () => load())

const onPageChange = (p: number) => {
  page.value = p
}

onMounted(async () => {
  await loadRefs()
  await load()
})
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Mouvements de stock</h1>
    </div>

    <!-- Filtres -->
<div class="grid grid-cols-4 gap-3">
  <SingleSelect
    :placeholder="$t('Product')"
    :data="products"
    :selected="selectedProduct"
    showKey="name"
    selectedKey="id"
    @select="onSelectProduct"
  />

  <SingleSelect
    :placeholder="$t('Warehouse')"
    :data="stocks"
    :selected="selectedStock"
    showKey="name"
    selectedKey="id"
    @select="onSelectStock"
  />

  <SingleSelect
    :placeholder="$t('Type')"
    :data="typeOptions"
    :selected="selectedType"
    showKey="name"
    selectedKey="id"
    @select="onSelectType"
  />

  <div class="flex gap-2">
    <UIInputDate
      :placeholder="$t('Start_date')"
      :model-value="displayStartDate"
      @update:model-value="updateStartDate"
    />
    <UIInputDate
      :placeholder="$t('End_date')"
      :model-value="displayEndDate"
      @update:model-value="updateEndDate"
    />
  </div>
</div>

    <!-- Table -->
<ScrollContainer>
  <UITable :loading="loading">
    <template #thead>
      <tr>
        <td>Produit</td>
        <td>Date</td>
        <td>Type</td>
        <td class="text-right">Qté</td>
        <td>Entrepôt</td>
        <td>Responsable</td>
        <td>Commande</td>
      </tr>
    </template>

    <template #t-row>
      <tr v-for="r in rows" :key="r.id">
        <td>{{ r.product?.name ?? '-' }}</td>
        <td>{{ r.date ?? '-' }}</td>

        <td>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="r.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ r.type === 'in' ? 'Entrée' : 'Sortie' }}
          </span>
        </td>

        <td class="text-right font-semibold">{{ r.quantity }}</td>
        <td>{{ r.stock?.name ?? '-' }}</td>
        <td>{{ r.responsible?.label ?? '-' }}</td>

        <td>
          <span
            v-if="r.order"
            class="text-blue-600 hover:underline cursor-pointer"
            @click="goToOrder(r.order)"
          >
            {{ r.order.label }}
          </span>
          <span v-else class="text-gray-400">-</span>
        </td>
      </tr>

      <NoData v-if="!loading && !rows.length" />
    </template>
  </UITable>
</ScrollContainer>

    <!-- Pagination -->
    <div class="flex justify-end" v-if="meta">
      <Pagination
        :currentPage="meta.current_page"
        :totalPages="meta.last_page"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>

