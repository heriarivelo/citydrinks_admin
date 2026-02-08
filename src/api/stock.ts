import { TStockItem } from '@/modules/stocks/store/types/stockTypes'
import { Meta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { ComputedRef } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

export const fetchStocks = async (
  params?: Record<string, any>
): Promise<{
  data: TStockItem[]
  meta: Meta
}> => {
  try {
    const res = await axiosClient('/admin/all-stock', {
      params: {
        per_page: 50,
        ...params,
      },
    })
    return res.data.data
  } catch (error) {
    throw new Error(error as string)
  }
}

export function useStocks(params?: ComputedRef<Record<string, any>>) {
  return useQuery({
    queryKey: ['stocks', params],
    queryFn: () => fetchStocks(params.value),
    placeholderData: keepPreviousData,
  })
}
