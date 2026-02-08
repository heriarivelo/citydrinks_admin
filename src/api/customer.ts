import { TMeta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { Customer } from './types/customer'
import { useQuery } from '@tanstack/vue-query'

export const fetchCustomers = async (
  params: Record<string, any>
): Promise<{
  data: Customer[]
  meta: TMeta
}> => {
  try {
    const res = await axiosClient('/admin/customers', {
      params: {
        per_page: 999,
        ...params,
      },
    })
    return res.data.data
  } catch (error) {
    throw new Error(error as string)
  }
}
