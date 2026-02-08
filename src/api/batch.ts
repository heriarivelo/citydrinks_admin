import { TMeta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { ComputedRef } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { TBatch } from '@/modules/buy/types/batchTypes'

export const fetchBatchHistory = async (
  params?: Record<string, any>
): Promise<{
  data: TBatch[]
  meta: TMeta
}> => {
  try {
    const res = await axiosClient('/admin/batches-history', {
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

export function useGetBatchHistory(params?: ComputedRef<Record<string, any>>) {
  return useQuery({
    queryKey: ['batch-history', params],
    queryFn: () => fetchBatchHistory(params.value),
    placeholderData: keepPreviousData,
  })
}
