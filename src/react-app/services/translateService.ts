export class TranslateService {
    private static API_URL = '/api/translate';

    private static getCacheKey(text: string, lang: string): string {
        return `trans_${lang}_${text.substring(0, 100)}`;
    }

    static async translateText(text: string | string[], targetLang: string, sourceLang: string = 'auto'): Promise<string | string[]> {
        const texts = Array.isArray(text) ? text : [text];
        const results: string[] = new Array(texts.length).fill('');
        const missingIndices: number[] = [];
        const missingTexts: string[] = [];

        // 1. Check Cache
        texts.forEach((t, i) => {
            const cached = localStorage.getItem(this.getCacheKey(t, targetLang));
            if (cached) {
                results[i] = cached;
            } else {
                missingIndices.push(i);
                missingTexts.push(t);
            }
        });

        if (missingTexts.length === 0) {
            return Array.isArray(text) ? results : results[0];
        }

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: missingTexts,
                    target_lang: targetLang,
                    source_lang: sourceLang,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Translation failed:', response.status, errorText);
                throw new Error(`Translation failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // 2. Update Results and Cache
            const translatedArr = Array.isArray(data.data) ? data.data : [data.data];
            translatedArr.forEach((item: any, idx: number) => {
                const originalText = missingTexts[idx];
                const translatedText = item.translated;
                const resultIdx = missingIndices[idx];

                results[resultIdx] = translatedText;
                localStorage.setItem(this.getCacheKey(originalText, targetLang), translatedText);
            });

            return Array.isArray(text) ? results : results[0];
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback to original text for missing items
            missingIndices.forEach((origIdx, missingIdx) => {
                results[origIdx] = missingTexts[missingIdx];
            });
            return Array.isArray(text) ? results : results[0];
        }
    }

    static async translateResources(resources: any[], targetLang: string): Promise<any[]> {
        if (!resources || resources.length === 0) return [];

        // Fields to translate - added 'tags'
        const fieldsToTranslate = ['title', 'description', 'category', 'audience', 'services', 'hours', 'tags'];
        const valuesToTranslate: string[] = [];
        const mapIndices: { resourceIndex: number, field: string }[] = [];

        // 1. Extract values
        resources.forEach((resource, index) => {
            fieldsToTranslate.forEach(field => {
                const val = resource[field];
                if (val && typeof val === 'string') {
                    valuesToTranslate.push(val);
                    mapIndices.push({ resourceIndex: index, field });
                } else if (val && Array.isArray(val)) {
                    // Handle array of tags or services if they are arrays
                    val.forEach((item, itemIdx) => {
                        if (typeof item === 'string') {
                            valuesToTranslate.push(item);
                            mapIndices.push({ resourceIndex: index, field: `${field}.${itemIdx}` });
                        }
                    });
                }
            });
        });

        if (valuesToTranslate.length === 0) return resources;

        // 2. Translate (translateText now handles batch caching)
        const translatedValues = await this.translateText(valuesToTranslate, targetLang);
        const translatedArr = Array.isArray(translatedValues) ? translatedValues : [translatedValues];

        // 3. Reconstruct
        const translatedResources = JSON.parse(JSON.stringify(resources));

        // Preserve original categories for map icons and filtering logic
        translatedResources.forEach((resource: any, idx: number) => {
            resource.category_raw = resources[idx].category;
        });

        mapIndices.forEach((mapM, i) => {
            if (translatedArr[i]) {
                if (mapM.field.includes('.')) {
                    const [field, index] = mapM.field.split('.');
                    translatedResources[mapM.resourceIndex][field][parseInt(index)] = translatedArr[i];
                } else {
                    translatedResources[mapM.resourceIndex][mapM.field] = translatedArr[i];
                }
            }
        });

        return translatedResources;
    }

    static async translateJSON(sourceJSON: any, targetLang: string): Promise<any> {
        // 1. Flatten the object
        const validKeys: string[] = [];
        const values: string[] = [];

        const flatten = (obj: any, prefix = '') => {
            for (const k in obj) {
                const value = obj[k];
                const key = prefix ? `${prefix}.${k}` : k;
                if (typeof value === 'string') {
                    validKeys.push(key);
                    values.push(value);
                } else if (typeof value === 'object' && value !== null) {
                    flatten(value, key);
                }
            }
        };

        flatten(sourceJSON);

        if (values.length === 0) return {};

        // 2. Translate values
        // Split into chunks to avoid payload limits if necessary (GoogleTrans unlimited but Vercel has limits)
        // 50 items per chunk is safe
        const chunkSize = 50;
        const translatedValues: string[] = [];

        for (let i = 0; i < values.length; i += chunkSize) {
            const chunk = values.slice(i, i + chunkSize);
            const translatedChunk = await this.translateText(chunk, targetLang) as string[];
            translatedValues.push(...translatedChunk);
        }

        // 3. Reconstruct object
        const result = {};
        const unflatten = (obj: any, key: string, value: string) => {
            const parts = key.split('.');
            let current = obj;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) current[part] = {};
                current = current[part];
            }
            current[parts[parts.length - 1]] = value;
        };

        validKeys.forEach((key, index) => {
            unflatten(result, key, translatedValues[index]);
        });

        return result;
    }
}
