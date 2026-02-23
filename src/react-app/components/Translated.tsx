import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/react-app/services/translation';

interface TranslatedProps {
    text: string | undefined;
}

export default function Translated({ text }: TranslatedProps) {
    const { i18n } = useTranslation();
    const [translatedText, setTranslatedText] = useState(text || '');

    useEffect(() => {
        if (!text) {
            setTranslatedText('');
            return;
        }

        if (i18n.language === 'en') {
            setTranslatedText(text);
            return;
        }

        const performTranslation = async () => {
            try {
                const result = await translationService.translate(text, i18n.language);
                setTranslatedText(result);
            } catch (error) {
                console.error('Translation error:', error);
                setTranslatedText(text);
            }
        };

        performTranslation();
    }, [text, i18n.language]);

    return <>{translatedText}</>;
}
