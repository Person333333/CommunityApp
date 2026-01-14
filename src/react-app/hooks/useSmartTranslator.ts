import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/react-app/services/translation';

export function useSmartTranslator() {
  const { i18n } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState<Map<string, string>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);

  const translateTexts = async (texts: Array<{ text: string; key: string }>): Promise<Map<string, string>> => {
    if (i18n.language === 'en') {
      // Return original texts for English
      const result = new Map<string, string>();
      texts.forEach(({ text, key }) => result.set(key, text));
      return result;
    }

    setIsTranslating(true);
    const results = new Map<string, string>();

    try {
      // Process texts one by one with delays to avoid rate limiting
      for (const { text, key } of texts) {
        if (!text.trim()) continue;

        // Check cache first
        if (translatedContent.has(key)) {
          results.set(key, translatedContent.get(key)!);
          continue;
        }

        try {
          const translated = await translationService.translate(text, i18n.language);
          results.set(key, translated);
          
          // Add to cache
          setTranslatedContent(prev => new Map(prev).set(key, translated));
          
          // Wait between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.warn('Translation failed for:', text);
          results.set(key, text);
        }
      }
    } finally {
      setIsTranslating(false);
    }

    return results;
  };

  const translateText = async (text: string, key: string): Promise<string> => {
    const results = await translateTexts([{ text, key }]);
    return results.get(key) || text;
  };

  // Clear cache when language changes
  useEffect(() => {
    setTranslatedContent(new Map());
  }, [i18n.language]);

  return { translateTexts, translateText, isTranslating };
}
