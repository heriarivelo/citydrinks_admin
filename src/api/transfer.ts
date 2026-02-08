import { TProduct } from '@/modules/stocks/products/store/types/productTypes'
import { TransferAll } from '@/modules/stocks/store/types/transferTypes'
import { Meta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { ComputedRef } from 'vue'

async function fetchTransfers({
  params,
  transferType,
}: {
  params?: Record<string, any>
  transferType: string
}): Promise<{
  data: TransferAll[]
  meta: Meta
}> {
  try {
    const res = await axiosClient(
      transferType === 'transfer-history'
        ? '/admin/transfer-history'
        : '/admin/transfer-list',
      {
        params: {
          per_page: 50,
          ...params,
        },
      }
    )
    return res.data
  } catch (error) {
    throw new Error(error as string)
  }
}

export function useTransfers({
  params,
  transferType,
}: {
  params?: ComputedRef<Record<string, any>>
  transferType: ComputedRef<string>
}) {
  return useQuery({
    queryKey: [transferType, params],
    queryFn: () =>
      fetchTransfers({
        params: params.value,
        transferType: transferType.value,
      }),
    placeholderData: keepPreviousData,
  })
}

export async function fetchTransfer(id: ComputedRef<number>): Promise<
  {
    quantity: number
    available_quantity: string | number
    lot_number: string
    expire_date: string
    history_ids: number[]
    product: TProduct
  }[]
> {
  try {
    const res = await axiosClient(`/admin/transfer-items/${id.value}`)
    return res.data.data.items
  } catch (error) {
    throw new Error(error as string)
  }
}
