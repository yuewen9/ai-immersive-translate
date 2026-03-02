/**
 * Constants for AI Immersive Translate
 */

import { Language, ExtensionConfig, ApiProviderOption } from '../types';

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

export const API_PROVIDERS: ApiProviderOption[] = [
  {
    value: 'bigmodel',
    label: 'BigModel',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: ['glm-4', 'glm-4-air', 'glm-3-turbo'],
    keyUrl: 'https://open.bigmodel.cn/',
    keyPlaceholder: 'Enter your BigModel API key',
  },
  {
    value: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'Enter your OpenAI API key',
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/chat/completions',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyPlaceholder: 'Enter your DeepSeek API key',
  },
  {
    value: 'kimi',
    label: 'Kimi',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyPlaceholder: 'Enter your Kimi API key',
  },
] as const;

export const API_PROVIDER_MAP = Object.fromEntries(
  API_PROVIDERS.map((provider) => [provider.value, provider])
) as Record<ApiProviderOption['value'], ApiProviderOption>;

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
