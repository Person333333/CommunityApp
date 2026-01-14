export class TranslationService {
  async translate(_text: string, _targetLang: string, _sourceLang: string = 'en'): Promise<string> {
    // TEMPORARILY DISABLED - API RATE LIMITING ISSUES
    console.log('Translation API temporarily disabled due to rate limiting');
    return _text;
    
    /* Original code below - re-enable when API issues are resolved
    // Skip translation if target is English or text is empty
    if (targetLang === 'en' || !text.trim()) {
      return text;
    }

    // Check cache first
    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Rate limiting - wait if we made a request too recently
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    // If there's already a request in progress, wait for it
    if (this.requestQueue) {
      return this.requestQueue;
    }

    // Create the translation request
    this.requestQueue = this.doTranslation(text, targetLang, sourceLang, cacheKey);
    
    try {
      const result = await this.requestQueue;
      return result;
    } finally {
      this.requestQueue = null;
    }
    */
  }
}

export const translationService = new TranslationService();
