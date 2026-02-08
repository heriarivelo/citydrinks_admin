import { TMeta } from '@/types/globalTypes.ts'

export type TCategories = {
  data: TCategory[]
  meta: TMeta
}

export type TCategory = {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}
