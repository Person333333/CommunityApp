import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '../services/translation';

export function useDynamicTranslation() {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  // Translate any text dynamically
  const translate = async (text: string, targetLang?: string): Promise<string> => {
    const target = targetLang || i18n.language;
    
    // Skip translation if target is English or text is empty
    if (target === 'en' || !text.trim()) {
      return text;
    }

    setIsTranslating(true);
    try {
      const translatedText = await translationService.translate(text, target);
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    isTranslating,
  };
}
