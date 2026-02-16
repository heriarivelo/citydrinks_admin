import axiosClient from '@/utils/axiosClient'

export const fetchStockMovements = async (params?: Record<string, any>) => {
  const res = await axiosClient('/admin/stock-movements', {
    params: {
      per_page: 50,
      ...params,
    },
  })
  return res.data
}
