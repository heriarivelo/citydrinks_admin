import { RouteRecordRaw } from 'vue-router'

import Report from '@/modules/others/report/views/Report.vue'

const adminOthersReportRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/report',
    component: Report,
    meta: {
      h2: 'Others',
      span: 'Report',
    },
  },
]

export default adminOthersReportRoutes
