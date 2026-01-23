import { TranslateService } from './translateService';

export class TranslationService {
  async translate(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    if (targetLang === 'en' || !text.trim()) {
      return text;
    }

    try {
      const result = await TranslateService.translateText(text, targetLang, sourceLang);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Dynamic translation failed:', error);
      return text;
    }
  }
}

export const translationService = new TranslationService();
