import { RouteRecordRaw } from 'vue-router'

import SettingPdf from '@/modules/others/settingPdf/views/SettingPdf.vue'

const adminOthersSettingPdfRoutes: Array<RouteRecordRaw> = [
  {
    path: 'others/setting-pdf',
    component: SettingPdf,
    meta: {
      h2: 'Others',
      span: 'Setting_PDF',
    },
  },
]

export default adminOthersSettingPdfRoutes
