import { TMeta } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { Provider } from './types/provider'

export const fetchProviders = async (
  params: Record<string, any>
): Promise<{
  data: Provider[]
  meta: TMeta
}> => {
  try {
    const res = await axiosClient('/admin/providers', {
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
