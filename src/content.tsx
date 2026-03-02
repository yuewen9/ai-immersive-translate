/**
 * Content script - Shift + Hover to translate
 */

import { Storage } from '@plasmohq/storage';
import { TextExtractor } from './core/extractor/TextExtractor';
import { TranslationEngine } from './core/translator/TranslationEngine';
import { BilingualRenderer } from './core/renderer/BilingualRenderer';
import { ExtensionConfig } from './types';
import { DEFAULT_CONFIG } from './lib/constants';

const storage = new Storage();

let config: ExtensionConfig = DEFAULT_CONFIG;
let translationEngine: TranslationEngine | null = null;
let renderer: BilingualRenderer | null = null;
let currentHoveredElement: HTMLElement | null = null;
let isShiftPressed = false;
let isTranslating = false;
let translationCache = new Map<string, string>();

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
      mode: 'inline-below', // 特殊模式：在元素下方显示
      fontSize: config.display.fontSize,
      fontFamily: config.display.fontFamily,
      textColor: config.display.textColor,
      highlightColor: config.display.highlightColor,
    });

    // Inject styles
    renderer.injectStyles();

    // Setup hover + shift listeners
    setupHoverTranslation();

    // Setup keyboard listeners
    setupKeyboardListeners();

    // Show usage hint
    showUsageHint();

    console.log('🌐 AI Immersive Translate initialized (Shift + Hover mode)');
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

/**
 * Setup hover translation
 */
function setupHoverTranslation() {
  // Track mouse movement
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;

    // Find the nearest text container
    const textContainer = findTextContainer(target);

    if (textContainer && textContainer !== currentHoveredElement) {
      currentHoveredElement = textContainer;

      // Highlight on hover if shift is pressed
      if (isShiftPressed) {
        highlightElement(textContainer);
      }
    }
  });

  // Handle mouse leave
  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    if (target === currentHoveredElement) {
      removeHighlight(target);
    }
  });

  console.log('✓ Hover translation enabled');
}

/**
 * Setup keyboard listeners for Shift key
 */
function setupKeyboardListeners() {
  document.addEventListener('keydown', async (e) => {
    if (e.key === 'Shift' && !isShiftPressed) {
      isShiftPressed = true;

      // If hovering over an element, translate it
      if (currentHoveredElement) {
        await translateCurrentElement();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = false;

      // Remove highlights
      document.querySelectorAll('.ai-translate-highlight').forEach(el => {
        removeHighlight(el as HTMLElement);
      });
    }
  });
}

/**
 * Find the nearest text container element
 */
function findTextContainer(element: HTMLElement): HTMLElement | null {
  // Check if element itself has enough text
  if (hasTranslatableText(element)) {
    return element;
  }

  // Check parent elements
  let parent = element.parentElement;
  let depth = 0;
  const maxDepth = 5;

  while (parent && depth < maxDepth) {
    if (shouldTranslateContainer(parent)) {
      return parent;
    }
    parent = parent.parentElement;
    depth++;
  }

  return null;
}

/**
 * Check if element has translatable text
 */
function hasTranslatableText(element: HTMLElement): boolean {
  const text = element.textContent?.trim() || '';
  if (text.length < 10) return false;
  if (text.length > 5000) return false;

  // Check if contains meaningful content
  return /[a-zA-Z\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]{20,}/.test(text);
}

/**
 * Check if container should be translated
 */
function shouldTranslateContainer(element: HTMLElement): boolean {
  // Skip certain tags
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'NAV', 'FOOTER', 'HEADER'];
  if (skipTags.includes(element.tagName)) {
    return false;
  }

  // Skip if has specific classes
  if (element.classList.contains('no-translate') ||
      element.dataset.translate === 'false') {
    return false;
  }

  return hasTranslatableText(element);
}

/**
 * Translate the currently hovered element
 */
async function translateCurrentElement() {
  if (!currentHoveredElement || isTranslating || !translationEngine) {
    return;
  }

  const element = currentHoveredElement;
  const text = element.textContent?.trim();

  if (!text || text.length < 10 || text.length > 5000) {
    return;
  }

  // Check cache
  const cacheKey = text.substring(0, 100);
  if (translationCache.has(cacheKey)) {
    showTranslation(element, translationCache.get(cacheKey)!);
    return;
  }

  isTranslating = true;
  highlightElement(element);

  try {
    // Show loading indicator
    showLoadingIndicator(element);

    // Translate
    const result = await translationEngine.translate(text, {
      from: config.translation.sourceLanguage,
      to: config.translation.targetLanguage,
    });

    // Cache result
    translationCache.set(cacheKey, result.translatedText);

    // Show translation
    showTranslation(element, result.translatedText);

    // Update statistics
    await updateStatistics();

  } catch (error) {
    console.error('Translation failed:', error);
    showErrorIndicator(element);
  } finally {
    isTranslating = false;
    hideLoadingIndicator(element);
  }
}

/**
 * Show translation below element
 */
function showTranslation(element: HTMLElement, translation: string) {
  // Remove existing translation if any
  removeTranslation(element);

  // Create translation container
  const translationDiv = document.createElement('div');
  translationDiv.className = 'ai-translate-inline-translation';
  translationDiv.setAttribute('data-ai-translate', 'inline');

  translationDiv.innerHTML = `
    <div class="ai-translate-divider"></div>
    <div class="ai-translate-content">
      <div class="ai-translate-badge">AI翻译</div>
      <div class="ai-translate-text">${escapeHtml(translation)}</div>
    </div>
  `;

  // Insert after the element
  if (element.parentNode) {
    element.parentNode.insertBefore(translationDiv, element.nextSibling);
  }

  // Highlight the original element
  element.classList.add('ai-translate-original-highlight');

  // Scroll into view if needed
  setTimeout(() => {
    translationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * Remove translation from element
 */
function removeTranslation(element: HTMLElement) {
  // Remove existing translation
  const existingTranslation = element.nextElementSibling;
  if (existingTranslation &&
      existingTranslation.getAttribute('data-ai-translate') === 'inline') {
    existingTranslation.remove();
  }

  element.classList.remove('ai-translate-original-highlight');
}

/**
 * Highlight element on hover
 */
function highlightElement(element: HTMLElement) {
  element.classList.add('ai-translate-highlight');
}

/**
 * Remove highlight from element
 */
function removeHighlight(element: HTMLElement) {
  element.classList.remove('ai-translate-highlight');
}

/**
 * Show loading indicator
 */
function showLoadingIndicator(element: HTMLElement) {
  element.classList.add('ai-translate-loading');
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator(element: HTMLElement) {
  element.classList.remove('ai-translate-loading');
}

/**
 * Show error indicator
 */
function showErrorIndicator(element: HTMLElement) {
  element.classList.add('ai-translate-error');
  setTimeout(() => {
    element.classList.remove('ai-translate-error');
  }, 2000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show usage hint
 */
function showUsageHint() {
  // Check if hint was already shown
  const hintShown = localStorage.getItem('ai_translate_hint_shown');
  if (hintShown) return;

  // Create hint element
  const hint = document.createElement('div');
  hint.className = 'ai-translate-usage-hint';
  hint.innerHTML = `
    💡 <strong>提示</strong>: 鼠标悬停在文本上，按住 <strong>Shift</strong> 键即可翻译！
  `;

  // Add click to dismiss
  hint.addEventListener('click', () => {
    hint.remove();
    localStorage.setItem('ai_translate_hint_shown', 'true');
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (hint.parentNode) {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 300);
    }
    localStorage.setItem('ai_translate_hint_shown', 'true');
  }, 10000);

  document.body.appendChild(hint);
}

/**
 * Update statistics
 */
async function updateStatistics() {
  try {
    const stats = await storage.get('ai_translate_statistics');
    const currentStats = stats && typeof stats === 'object' ? stats as any : {
      translationsCount: 0,
      charactersCount: 0,
      apiCost: 0,
    };

    await storage.set('ai_translate_statistics', {
      ...currentStats,
      translationsCount: (currentStats.translationsCount || 0) + 1,
    });
  } catch (error) {
    console.error('Failed to update statistics:', error);
  }
}

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.type === 'TRANSLATE_PAGE') {
    // For now, just show a message
    alert('Please hover over any text and press Shift to translate!');
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

      // Clear cache on config change
      translationCache.clear();
    }
  }
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
