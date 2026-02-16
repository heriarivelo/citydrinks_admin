<script setup lang="ts">
import IconDashboard from '@/components/icons/IconDashboard.vue'
import IconSale from '@/components/icons/IconSale.vue'
import IconStock from '@/components/icons/IconStock.vue'
import { clearAllScrollPositions, cn } from '@/lib/utils'
import { STOCK_NAME_BY_TYPE } from '@/modules/stocks/constants.ts'
import { useStockStore } from '@/modules/stocks/store/stock.ts'
import { TStock } from '@/modules/stocks/store/types/stockTypes.ts'
import { useHeaderStore } from '@/store/headerStore.ts'
import { HandCoins, LayoutList } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import SidebarItem from './SidebarItem.vue'
import { ScrollArea } from '../ui/scroll-area'

const route = useRoute()
const headerStore = useHeaderStore()
const stockStore = useStockStore()
const { headerData } = storeToRefs(headerStore)
const { stocks, selectedStock } = storeToRefs(stockStore)

watchEffect(() => {
  if (/^\/admin\/stocks\/[0-9]+$/.test(route.path) && route.params?.stock) {
    selectedStock.value = stocks.value.filter((stock) => {
      return stock.id == route.params.stock
    })?.[0]
    headerData.value.span =
      stocks.value.filter((stock) => {
        return stock.id == route.params.stock
      })?.[0]?.name ?? ''
  } else {
    headerData.value.span = ''
    selectedStock.value = {} as TStock
  }
})

onMounted(async () => {
  await stockStore.actionGetStocks()
})
</script>

<template>
  <div class="sidebar z-20 flex w-[248px] flex-col bg-background">
    <RouterLink
      to="/admin/dashboard"
      class="logo mx-auto mb-4 mt-8"
      @click="clearAllScrollPositions"
    >
      <img src="../../assets/images/png/sidebar-logo.png" alt="logo" class="w-14 h-14" />
    </RouterLink>
    <ScrollArea class="h-[calc(100dvh-100px)]">
      <div class="menu flex flex-col">
        <RouterLink
          class="item-link body-text flex w-full cursor-pointer items-center gap-2 p-4 ps-5 hover:underline"
          :to="'/admin/dashboard'"
          :class="{
            'border-r border-muted bg-primary text-background':
              $route.path === '/admin/dashboard',
          }"
          @click="clearAllScrollPositions"
        >
          <IconDashboard />
          {{ $t('Dashboard') }}
        </RouterLink>

        <Accordion type="multiple">
          <AccordionItem value="buy" class="border-b-0">
            <AccordionTrigger
              class="pe-4 ps-5 font-normal"
              :class="{
                'border-r border-muted bg-primary text-background':
                  $route.path.startsWith('/admin/buy'),
              }"
            >
              <div class="flex gap-2">
                <IconSale />
                {{ $t('Buy') }}
              </div>
            </AccordionTrigger>
            <AccordionContent class="flex flex-col">
              <SidebarItem
                title="New_Batch"
                path="/admin/buy/0/add-new-batch"
                :isActive="
                  /^\/admin\/buy\/\d+\/add-new-batch$/.test($route.path)
                "
              />
              <SidebarItem
                title="Batch_Status"
                path="/admin/buy/status-batch"
                :isActive="$route.path.startsWith('/admin/buy/status-batch')"
              />
              <SidebarItem
                title="History_Batch"
                path="/admin/buy/history-batch"
                :isActive="$route.path.startsWith('/admin/buy/history-batch')"
              />
              <SidebarItem
                title="Providers"
                path="/admin/buy/providers"
                :isActive="$route.path.startsWith('/admin/buy/providers')"
              />
              <SidebarItem
                title="Payment"
                path="/admin/buy/payment"
                :isActive="$route.path.startsWith('/admin/buy/payment')"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sell" class="border-b-0">
            <AccordionTrigger
              class="pe-4 ps-5 font-normal"
              :class="{
                'border-r border-muted bg-primary text-background':
                  $route.path.startsWith('/admin/sell'),
              }"
            >
              <div class="flex gap-2">
                <HandCoins
                  :size="20"
                  :color="
                    cn(
                      $route.path.startsWith('/admin/sell') &&
                        'hsl(var(--background))'
                    )
                  "
                />
                {{ $t('Sell') }}
              </div>
            </AccordionTrigger>
            <AccordionContent class="flex flex-col">
              <SidebarItem
                title="New_Order"
                path="/admin/sell/orders/create"
                :isActive="$route.path === '/admin/sell/orders/create'"
              />
              <SidebarItem
                title="Order_Status"
                path="/admin/sell/orders"
                :isActive="
                  ($route.path.startsWith('/admin/sell/orders') ||
                    $route.path === '/admin/sell/see-all') &&
                  !$route.path.startsWith('/admin/sell/orders/create')
                "
              />
              <SidebarItem
                title="Order_History"
                path="/admin/sell/history"
                :isActive="$route.path.startsWith('/admin/sell/history')"
              />
              <SidebarItem
                title="Customers"
                path="/admin/sell/customers"
                :isActive="$route.path.startsWith('/admin/sell/customer')"
              />
              <SidebarItem
                title="Payment"
                path="/admin/sell/payment"
                :isActive="$route.path.startsWith('/admin/sell/payment')"
              />
              <SidebarItem
                title="Promotion"
                path="/admin/sell/promotion"
                :isActive="$route.path.startsWith('/admin/sell/promotion')"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stocks" class="border-b-0">
            <AccordionTrigger
              class="pe-4 ps-5 font-normal"
              :class="{
                'border-r border-muted bg-primary text-background':
                  $route.path.startsWith('/admin/stocks'),
              }"
            >
              <div class="flex gap-2">
                <IconStock />
                {{ $t('Stocks') }}
              </div>
            </AccordionTrigger>
            <AccordionContent class="flex flex-col">
              <SidebarItem
                title="New_Transfer"
                path="/admin/stocks/0/transfer-products"
                :isActive="
                  $route.path.startsWith('/admin/stocks/0/transfer-products')
                "
              />
              <SidebarItem
                title="Transfer_Status"
                path="/admin/stocks/transfer-status"
                :isActive="
                  $route.path.startsWith('/admin/stocks/transfer-status')
                "
              />
              <AccordionItem value="sub-stocks" class="border-b-0">
                <AccordionTrigger
                  class="py-2.5 pe-4 ps-14 font-normal"
                  :class="{
                    'border-r border-muted bg-primary/10':
                      $route.path === '/admin/stocks/all-stocks' ||
                      /^\/admin\/stocks\/\d+$/.test($route.path),
                  }"
                >
                  <div class="flex gap-2">
                    {{ $t('Stocks') }}
                  </div>
                </AccordionTrigger>
                <AccordionContent class="flex flex-col">
                  <SidebarItem
                    title="All_Stocks"
                    path="/admin/stocks/all-stocks"
                    :isActive="
                      $route.path.startsWith('/admin/stocks/all-stocks')
                    "
                    class-name="ps-16"
                  />
                  <RouterLink
                    :to="`/admin/stocks/${stock.id}`"
                    v-for="stock in stocks"
                    class="body-text py-2 pe-2.5 ps-12 transition-colors"
                    :class="
                      cn(
                        'body-text py-2 pe-2.5 ps-16 transition-colors',
                        $route.path !== `/admin/stocks/${stock.id}` &&
                          'hover:bg-indigo-50/30'
                      )
                    "
                    @click="clearAllScrollPositions"
                  >
                    <div
                      class="rounded-s-sm py-0.5 ps-2"
                      :class="
                        cn(
                          $route.path === `/admin/stocks/${stock.id}` &&
                            'border-e-2 border-primary bg-indigo-50'
                        )
                      "
                    >
                      {{ stock.name }} /<span
                        class="body-text"
                        style="color: var(--gray-300)"
                        >{{ STOCK_NAME_BY_TYPE[stock.type] }}</span
                      >
                    </div>
                  </RouterLink>
                </AccordionContent>
              </AccordionItem>
              <SidebarItem
                title="Product"
                path="/admin/stocks/products"
                :isActive="$route.path.startsWith('/admin/stocks/products')"
              />
              <SidebarItem
                title="History_Product"
                path="/admin/stocks/history-product"
                :isActive="
                  $route.path.startsWith('/admin/stocks/history-product')
                "
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="order" class="border-b-0">
            <AccordionTrigger
              class="pe-4 ps-5 font-normal"
              :class="{
                'border-r border-muted bg-primary text-background':
                  $route.path.startsWith('/admin/others'),
              }"
            >
              <div class="flex gap-2">
                <LayoutList
                  :size="20"
                  :color="
                    $route.path.startsWith('/admin/others') &&
                    'hsl(var(--background))'
                  "
                />
                {{ $t('Others') }}
              </div>
            </AccordionTrigger>
            <AccordionContent class="flex flex-col">
              <SidebarItem
                title="Shipping"
                path="/admin/others/shipping"
                :isActive="$route.path.startsWith('/admin/others/shipping')"
              />
              <SidebarItem
                title="Related_Product"
                path="/admin/others/related"
                :isActive="$route.path.startsWith('/admin/others/related')"
              />
              <SidebarItem
                title="Employees"
                path="/admin/others/employees"
                :isActive="$route.path.startsWith('/admin/others/employees')"
              />

              <SidebarItem
                title="Roles"
                path="/admin/others/roles"
                :isActive="$route.path.startsWith('/admin/others/roles')"
              />

              <SidebarItem
                title="Report"
                path="/admin/others/report"
                :isActive="$route.path.startsWith('/admin/others/report')"
              />
              <SidebarItem
                title="Setting_PDF"
                path="/admin/others/setting-pdf"
                :isActive="$route.path.startsWith('/admin/others/setting-pdf')"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  </div>
</template>
