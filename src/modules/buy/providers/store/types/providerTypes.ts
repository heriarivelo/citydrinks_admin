import { TMeta } from '@/types/globalTypes.ts'

export type TProviders = {
  data: TProvider[]
  meta: TMeta
}

export type TProvider = {
  company: string
  first_name: string
  last_name: string
  user_name: string
  address: string
  vat: string
  updated_at: string
  created_at: string
  id?: number | string
  phone_number: string
  email: string
  balance: string
  status: string
}

export type TProviderErrors = {
  company: string
  first_name: string
  last_name: string
  user_name: string
  address: string
  vat: string
  id: number
  email: string
  phone_number: string
  balance: string
}

export type TProviderQuery = {
  page: number
  per_page: number
  all: string
  'sort[]': string
}
