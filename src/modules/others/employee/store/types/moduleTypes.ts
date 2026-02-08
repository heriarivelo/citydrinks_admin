import { TMeta } from '@/types/globalTypes.ts'
import { TPermission } from '@/modules/others/role/store/types/roleTypes.ts'

export type TModules = {
  data: TModule[]
  meta: TMeta
}
export type TModule = {
  id: number
  name: string
  created_at: string
  updated_at: string
  permissions: {
    data: TPermission[]
  }
}
