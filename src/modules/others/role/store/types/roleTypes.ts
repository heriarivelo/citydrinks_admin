import { TMeta } from '@/types/globalTypes.ts'
import { TModule } from '@/modules/others/employee/store/types/moduleTypes.ts'

export type TRoles = {
  data: TRole[]
  meta: TMeta
}

export type TRole = {
  id: number
  name: string
  created_at: string
  updated_at: string
  modules: TModule[]
  permissions: TPermission[]
  'permissions[0]': number
  'modules[0]': number
}

export type TPermission = {
  id: number
  module_id: number
  name: string
  created_at: string
  updated_at: string
}

export type TRoleQuery = {
  'include[0]': string
  'include[1]': string
  page: number
  per_page: number
  name: string
}
