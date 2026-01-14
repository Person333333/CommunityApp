import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';

export function usePageTranslator() {
  const { i18n } = useTranslation();
  const { translate } = useDynamicTranslation();
  const [translatedContent, setTranslatedContent] = useState<Map<string, string>>(new Map());

  const translateText = async (text: string, key?: string): Promise<string> => {
    if (i18n.language === 'en' || !text.trim()) {
      return text;
    }

    const cacheKey = key || text;
    
    // Check cache first
    if (translatedContent.has(cacheKey)) {
      return translatedContent.get(cacheKey)!;
    }

    try {
      const translated = await translate(text);
      
      // Cache the translation
      setTranslatedContent(prev => new Map(prev).set(cacheKey, translated));
      
      return translated;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  // Clear cache when language changes
  useEffect(() => {
    setTranslatedContent(new Map());
  }, [i18n.language]);

  return { translateText };
}
