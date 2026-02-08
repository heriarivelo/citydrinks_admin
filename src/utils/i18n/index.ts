import { createI18n } from 'vue-i18n'
import en from './en.json'

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en: en,
    fr: en,
  },
})

export default i18n
