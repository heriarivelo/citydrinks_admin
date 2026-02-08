import { Meta, PaymentType } from '@/types/globalTypes'
import axiosClient from '@/utils/axiosClient'
import { Payment } from './types/payment'

export const fetchPayments = async ({
  params,
  type,
}: {
  params?: Record<string, any>
  type: PaymentType
}): Promise<{
  data: Payment[]
  meta: Meta
}> => {
  try {
    const res = await axiosClient(
      type === 'sell' ? '/admin/payments' : '/admin/payments/provider',
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
