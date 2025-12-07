import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './LanguageContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, category?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: TranslationKey, category?: string): string => {
    const translation = translations[language][key];
    
    // Handle category translations
    if (category && key === 'categories') {
      const categories = translations[language].categories as Record<string, string>;
      return categories[category] || category;
    }
    
    // Handle nested objects (like categories)
    if (typeof translation === 'object' && translation !== null) {
      return key; // fallback to key if it's an object
    }
    
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
