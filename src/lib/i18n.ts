import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from '@/assets/locales/en/translation.json'
import urTranslation from '@/assets/locales/ur/translation.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ur: { translation: urTranslation },
  },
  lng: localStorage.getItem('lang') ?? import.meta.env.VITE_DEFAULT_LANGUAGE ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
