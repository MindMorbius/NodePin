import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import zh from './locales/zh';
import magic from './locales/magic';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      magic: { translation: magic }
    },
    lng: 'magic',
    fallbackLng: 'magic',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 