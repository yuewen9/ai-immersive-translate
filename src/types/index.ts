/**
 * Core types for AI Immersive Translate
 */

export type ApiProvider = 'bigmodel' | 'openai' | 'deepseek' | 'kimi';

// Translation unit structure
export interface TranslationUnit {
  id: string;
  originalText: string;
  translatedText?: string;
  element: HTMLElement;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

// Translation options
export interface TranslationOptions {
  from: string;
  to: string;
  model?: string;
  temperature?: number;
}

// Translation result
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  model: string;
  timestamp: number;
}

// Render modes
export type RenderMode = 'side-by-side' | 'top-bottom' | 'hover';

// Extension configuration
export interface ExtensionConfig {
  api: {
    provider: ApiProvider;
    apiKey: string;
    model: string;
  };
  translation: {
    sourceLanguage: string;
    targetLanguage: string;
    autoTranslate: boolean;
    translateOnHover: boolean;
  };
  display: {
    mode: RenderMode;
    fontSize: number;
    fontFamily: string;
    textColor: string;
    highlightColor: string;
  };
  advanced: {
    cacheEnabled: boolean;
    cacheExpiry: number;
    rateLimit: number;
  };
}

// Cache entry
export interface CacheEntry {
  key: string;
  result: TranslationResult;
  timestamp: number;
}

// Statistics
export interface UsageStatistics {
  date: string;
  translationsCount: number;
  charactersCount: number;
  apiCost: number;
}

// Language options
export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export interface ApiProviderOption {
  value: ApiProvider;
  label: string;
  endpoint: string;
  models: string[];
  keyUrl: string;
  keyPlaceholder: string;
}

// Message types for extension communication
export type ExtensionMessage =
  | { type: 'TRANSLATE_PAGE'; payload: { url: string } }
  | { type: 'TRANSLATE_TEXT'; payload: { text: string; options: TranslationOptions } }
  | { type: 'GET_TRANSLATION'; payload: { id: string } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'GET_STATISTICS' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ExtensionConfig> };
