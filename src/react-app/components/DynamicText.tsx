import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';

interface DynamicTextProps {
  children: string;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function DynamicText({ children, className, as: Component = 'span' }: DynamicTextProps) {
  const { i18n } = useTranslation();
  const { translate } = useDynamicTranslation();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    const translateText = async () => {
      if (i18n.language === 'en') {
        setTranslatedText(children);
        return;
      }

      try {
        const translated = await translate(children);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(children);
      }
    };

    translateText();
  }, [children, i18n.language]);

  const TagName = Component;
  return <TagName className={className}>{translatedText}</TagName>;
}
