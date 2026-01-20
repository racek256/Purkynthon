import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import cs from './locales/cs.json';

// Get stored language preference from cookie or default to Czech
const getStoredLanguage = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'language') {
      return value;
    }
  }
  return 'cs'; // Default to Czech
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      cs: { translation: cs }
    },
    lng: getStoredLanguage(),
    fallbackLng: 'cs',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
