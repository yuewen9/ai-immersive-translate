/**
 * Translation engine using BigModel API
 */

import { TranslationOptions, TranslationResult } from '../../types';
import { API_PROVIDER_MAP } from '../../lib/constants';
import { cacheManager } from '../cache/CacheManager';

export class TranslationEngine {
  private apiKey: string;
  private model: string;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // 100ms between requests

  constructor(apiKey: string, model: string = 'glm-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Update API key
   */
  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Translate a single text
   */
  async translate(text: string, options: TranslationOptions): Promise<TranslationResult> {
    if (!this.apiKey) {
      throw new Error('API key is not set');
    }

    // Check cache first
    const cached = await cacheManager.get(text, options.from, options.to);
    if (cached) {
      console.log('Translation found in cache');
      return cached;
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.callAPI(text, options);
          // Cache the result
          await cacheManager.set(text, options.from, options.to, result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts: string[], options: TranslationOptions): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    for (const text of texts) {
      try {
        const result = await this.translate(text, options);
        results.push(result);
      } catch (error) {
        console.error('Failed to translate text:', error);
        throw error;
      }
    }
    return results;
  }

  /**
   * Call BigModel API
   */
  private async callAPI(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    const targetLang = this.getLanguageName(options.to);
    const sourceLang = options.from === 'auto' ? 'detected language' : this.getLanguageName(options.from);

    const prompt = options.from === 'auto'
      ? `Detect the language and translate the following text to ${targetLang}. Only provide the translation, no explanations:\n\n${text}`
      : `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation, no explanations:\n\n${text}`;

    try {
      const response = await fetch(API_PROVIDER_MAP.bigmodel.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature ?? 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        this.lastRequestTime = Date.now();

        return {
          originalText: text,
          translatedText: data.choices[0].message.content.trim(),
          sourceLanguage: options.from,
          targetLanguage: options.to,
          model: this.model,
          timestamp: Date.now(),
        };
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Translation API error:', error);
      throw error;
    }
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const request = this.requestQueue.shift();

    if (request) {
      try {
        await request();
      } catch (error) {
        console.error('Request failed:', error);
      }
    }

    this.isProcessing = false;

    // Process next request
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Get language name from code
   */
  private getLanguageName(code: string): string {
    const languageMap: Record<string, string> = {
      en: 'English',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ar: 'Arabic',
      hi: 'Hindi',
    };

    return languageMap[code] || code;
  }
}
