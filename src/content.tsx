/**
 * Content script - runs on web pages
 */

import { Storage } from '@plasmohq/storage';
import { TextExtractor } from './core/extractor/TextExtractor';
import { TranslationEngine } from './core/translator/TranslationEngine';
import { BilingualRenderer } from './core/renderer/BilingualRenderer';
import { ExtensionConfig, TranslationUnit } from './types';
import { DEFAULT_CONFIG } from './lib/constants';

const storage = new Storage();

let config: ExtensionConfig = DEFAULT_CONFIG;
let translationEngine: TranslationEngine | null = null;
let renderer: BilingualRenderer | null = null;
let isTranslating = false;

// Initialize
async function init() {
  try {
    // Load config
    const savedConfig = await storage.get<ExtensionConfig>('ai_translate_config');
    if (savedConfig) {
      config = savedConfig;
    }

    // Initialize translation engine if API key is set
    if (config.api.apiKey) {
      translationEngine = new TranslationEngine(config.api.apiKey, config.api.model);
    }

    // Initialize renderer
    renderer = new BilingualRenderer({
      mode: config.display.mode,
      fontSize: config.display.fontSize,
      fontFamily: config.display.fontFamily,
      textColor: config.display.textColor,
      highlightColor: config.display.highlightColor,
    });

    // Inject styles
    renderer.injectStyles();

    // Create float button
    if (renderer) {
      renderer.createFloatButton(handleTranslatePage);
    }

    // Auto-translate if enabled
    if (config.translation.autoTranslate) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        handleTranslatePage();
      }, 1000);
    }

    console.log('AI Immersive Translate initialized');
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

// Handle translate page
async function handleTranslatePage() {
  if (isTranslating) {
    console.log('Translation already in progress');
    return;
  }

  if (!translationEngine) {
    alert('Please set your BigModel API key in settings first');
    return;
  }

  isTranslating = true;

  try {
    console.log('Starting page translation...');

    // Extract text
    const extractor = new TextExtractor();
    const units = extractor.extractMainContent();
    console.log(`Found ${units.length} translatable units`);

    if (units.length === 0) {
      alert('No translatable content found on this page');
      return;
    }

    // Translate units
    let translatedCount = 0;
    const total = units.length;

    for (const unit of units) {
      try {
        // Update progress
        if (renderer) {
          renderer.updateProgress(translatedCount + 1, total);
        }

        // Translate
        const result = await translationEngine!.translate(unit.originalText, {
          from: config.translation.sourceLanguage,
          to: config.translation.targetLanguage,
        });

        // Render translation
        if (renderer) {
          renderer.renderTranslation(unit, result.translatedText);
        }

        translatedCount++;

        // Update statistics
        await updateStatistics(translatedCount);
      } catch (error) {
        console.error('Failed to translate unit:', error);
      }
    }

    // Hide progress
    if (renderer) {
      renderer.hideProgress();
    }

    console.log(`Translation completed: ${translatedCount}/${total} units`);

    // Show success message
    alert(`Successfully translated ${translatedCount} paragraphs!`);
  } catch (error) {
    console.error('Translation failed:', error);
    alert('Translation failed. Please try again.');
  } finally {
    isTranslating = false;
  }
}

// Update statistics
async function updateStatistics(count: number) {
  try {
    const stats = await storage.get('ai_translate_statistics');
    const currentStats = stats && typeof stats === 'object' ? stats as any : {
      translationsCount: 0,
      charactersCount: 0,
      apiCost: 0,
    };

    await storage.set('ai_translate_statistics', {
      ...currentStats,
      translationsCount: (currentStats.translationsCount || 0) + count,
    });
  } catch (error) {
    console.error('Failed to update statistics:', error);
  }
}

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.type === 'TRANSLATE_PAGE') {
    handleTranslatePage();
    sendResponse({ success: true });
  }

  return true;
});

// Listen for config changes
storage.watch({
  ai_translate_config: (newConfig) => {
    console.log('Config updated:', newConfig);
    if (newConfig && typeof newConfig === 'object') {
      config = newConfig as ExtensionConfig;

      // Reinitialize translation engine
      if (config.api.apiKey) {
        translationEngine = new TranslationEngine(config.api.apiKey, config.api.model);
      }

      // Reinitialize renderer
      if (renderer) {
        renderer.clearAll();
        renderer = new BilingualRenderer({
          mode: config.display.mode,
          fontSize: config.display.fontSize,
          fontFamily: config.display.fontFamily,
          textColor: config.display.textColor,
          highlightColor: config.display.highlightColor,
        });
        renderer.injectStyles();
      }
    }
  }
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
