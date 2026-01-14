import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import zhTranslations from './locales/zh-CN.json';

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  'zh-cn': { translation: zhTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // load saved language or default
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false // React already escapes
    },

    react: {
      useSuspense: false
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
