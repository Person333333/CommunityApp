export class TranslateService {
    private static API_URL = '/api/translate';

    static async translateText(text: string | string[], targetLang: string, sourceLang: string = 'auto'): Promise<string | string[]> {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
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
            console.log('Translation received:', data);

            if (Array.isArray(text)) {
                return data.data.map((item: any) => item.translated);
            } else {
                return data.data.translated;
            }
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    static async translateResources(resources: any[], targetLang: string): Promise<any[]> {
        if (!resources || resources.length === 0) return [];

        // Fields to translate
        const fieldsToTranslate = ['title', 'description', 'category', 'audience', 'services', 'hours'];
        const valuesToTranslate: string[] = [];
        const mapIndices: { resourceIndex: number, field: string }[] = [];

        // 1. Extract values
        resources.forEach((resource, index) => {
            fieldsToTranslate.forEach(field => {
                if (resource[field] && typeof resource[field] === 'string') {
                    valuesToTranslate.push(resource[field]);
                    mapIndices.push({ resourceIndex: index, field });
                }
            });
        });

        if (valuesToTranslate.length === 0) return resources;

        // 2. Translate in chunks
        // Server handles sub-batching, but let's be safe and chunk here too
        const chunkSize = 50;
        const translatedValues: string[] = [];

        for (let i = 0; i < valuesToTranslate.length; i += chunkSize) {
            const chunk = valuesToTranslate.slice(i, i + chunkSize);
            try {
                // If chunk has only 1 item, translateText returns a string, handle that
                const result = await this.translateText(chunk, targetLang);
                if (Array.isArray(result)) {
                    translatedValues.push(...result);
                } else {
                    translatedValues.push(result);
                }
            } catch (error) {
                console.error('Chunk translation failed, using originals:', error);
                translatedValues.push(...chunk);
            }
        }

        // 3. Reconstruct
        // Deep copy resources to avoid mutating original state
        const translatedResources = JSON.parse(JSON.stringify(resources));

        mapIndices.forEach((mapM, i) => {
            if (translatedValues[i]) {
                translatedResources[mapM.resourceIndex][mapM.field] = translatedValues[i];
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
