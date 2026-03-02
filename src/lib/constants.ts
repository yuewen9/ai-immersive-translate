/**
 * Constants for AI Immersive Translate
 */

import { Language, ExtensionConfig } from '../types';

// Supported languages
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

// Default configuration
export const DEFAULT_CONFIG: ExtensionConfig = {
  api: {
    provider: 'bigmodel',
    apiKey: '',
    model: 'glm-4',
  },
  translation: {
    sourceLanguage: 'auto',
    targetLanguage: 'en',
    autoTranslate: false,
    translateOnHover: true,
  },
  display: {
    mode: 'hover',
    fontSize: 14,
    fontFamily: 'system-ui',
    textColor: '#333333',
    highlightColor: '#fff3cd',
  },
  advanced: {
    cacheEnabled: true,
    cacheExpiry: 7, // days
    rateLimit: 10, // requests per second
  },
};

// BigModel API endpoints
export const BIGMODEL_API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// Storage keys
export const STORAGE_KEYS = {
  CONFIG: 'ai_translate_config',
  CACHE: 'ai_translate_cache',
  STATISTICS: 'ai_translate_statistics',
} as const;

// DOM selectors to exclude from translation
export const EXCLUDED_SELECTORS = [
  'script',
  'style',
  'noscript',
  'code',
  'pre',
  '[data-translate="false"]',
  '.no-translate',
  'nav',
  'footer',
  'header',
  '.navigation',
  '.menu',
  '.sidebar',
];

// Minimum text length for translation
export const MIN_TEXT_LENGTH = 2;
export const MAX_TEXT_LENGTH = 5000;

// Cache duration in milliseconds
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
