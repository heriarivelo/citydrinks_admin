import { TRole } from '@/modules/others/role/store/types/roleTypes.ts'
import { TMeta } from '@/types/globalTypes.ts'

export type TEmployees = {
  data: TEmployee[]
  meta: TMeta
}

export type TEmployee = {
  id: number
  email: string
  phone_number: string
  user_name: string
  first_name: string
  last_name: string
  address: string
  one_time_password: any
  status: number
  created_at: string
  updated_at: string
  role: {
    data: TRole
  }
}
export type TEmployeeQuery = {
  'include[0]': string
  'include[1]': string
  page: number
  per_page: number
  'sort[]': string
  all: string
}

export type TEmployeeErrors = {
  role_id: string
  user_name: string
  email: string
  phone_number: string
  phone: string
  first_name: string
  last_name: string
  company: string
  vat: string
  address: string
  position?: string
  status?: string
}
