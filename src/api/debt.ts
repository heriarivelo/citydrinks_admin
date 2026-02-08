import { Meta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { Debt } from './types/debt'

export const fetchDebts = async (
  params: Record<string, any>
): Promise<{
  data: Debt[]
  meta: Meta
}> => {
  try {
    const res = await axiosClient('/admin/payments/debt', {
      params: {
        per_page: 50,
        ...params,
      },
    })
    return res.data
  } catch (error) {
    throw new Error(error as string)
  }
}
