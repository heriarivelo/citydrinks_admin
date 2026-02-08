import { TMeta } from '@/types/globalTypes.ts'

export type TTariffs = {
  data: TTariff[]
  meta: TMeta
}

export type TTariff = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}
