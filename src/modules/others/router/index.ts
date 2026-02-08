import { RouteRecordRaw } from 'vue-router'
import adminOthersRolesRoutes from '../role/router'
import adminOthersReportRoutes from '../report/router'
import adminOthersSettingPdfRoutes from '../settingPdf/router'
import adminRelatedProductsRoutes from '../relatedProduct/router'

const adminOthersRoutes: Array<RouteRecordRaw> = [
  ...adminRelatedProductsRoutes,
  ...adminOthersRolesRoutes,
  ...adminOthersReportRoutes,
  ...adminOthersSettingPdfRoutes,
]

export default adminOthersRoutes
