import { TMeta } from '@/types/globalTypes.ts'

export type TCustomers = {
  data: TCustomer[]
  meta: TMeta
}

export type TCustomer = {
  company: string
  first_name: string
  last_name: string
  user_name: string
  address: string
  vat: string
  updated_at: string
  created_at: string
  id: number
  phone: string
  email: string
  tariff: any
  tariff_id: number
  shipping_id: number
  tariffs: any
  shipping: any
  balance: number | string
  status: number
  password?: string
}

export type TCustomerErrors = {
  company: string
  first_name: string
  last_name: string
  user_name: string
  address: string
  vat: string
  id: number
  email: string
  phone: string
  phone_number: string
  tariff: string
  shipping_id: string
  password?: string
}

export type TCustomerQuery = {
  page: number
  per_page: number
  all: string
  status: string
  include: string
}
