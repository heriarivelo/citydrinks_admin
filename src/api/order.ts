import { ORDER_STATUS } from '@/modules/sell/orders/constants'
import {
  TOrderStatus,
  TOrdersItems,
} from '@/modules/sell/orders/store/types/ordersTypes'
import axiosClient from '@/utils/axiosClient'
import { useQuery } from '@tanstack/vue-query'

const fetchOrders = async (type: TOrderStatus): Promise<TOrdersItems> => {
  try {
    const res = await axiosClient('/admin/orders', {
      params: {
        per_page: 12,
        status: ORDER_STATUS[type],
      },
    })
    return res.data.data
  } catch (error) {
    throw new Error(error as string)
  }
}

export function useOrders(type: TOrderStatus) {
  return useQuery({
    queryKey: ['orders', type],
    queryFn: () => fetchOrders(type),
  })
}
