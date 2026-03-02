/**
 * Content script - Simplified working version
 */

console.log('🌐 AI Immersive Translate Loading...');

import { Storage } from '@plasmohq/storage';
import { TranslationEngine } from './core/translator/TranslationEngine';
import { ExtensionConfig } from './types';
import { DEFAULT_CONFIG } from './lib/constants';

const storage = new Storage();

let config: ExtensionConfig = DEFAULT_CONFIG;
let translationEngine: TranslationEngine | null = null;
let isShiftPressed = false;
let currentElement: HTMLElement | null = null;

// Inject styles immediately
const style = document.createElement('style');
style.textContent = `
  .ai-translate-highlight {
    outline: 3px solid #667eea !important;
    outline-offset: 2px;
    background-color: rgba(102, 126, 234, 0.1) !important;
    cursor: pointer;
  }
  .ai-translate-result {
    margin: 12px 0;
    padding: 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-left: 4px solid #667eea;
    border-radius: 6px;
    font-family: Arial, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #333;
    animation: slideIn 0.3s ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ai-translate-loading {
    position: relative;
  }
  .ai-translate-loading::after {
    content: '翻译中...';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;
document.head.appendChild(style);
console.log('✅ Styles injected');

// Show test indicator
function showTestIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ai-translate-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  indicator.innerHTML = '🌐 AI Translate Active<br><small>Shift+Hover to translate</small>';
  document.body.appendChild(indicator);
  console.log('✅ Indicator shown');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transition = 'opacity 0.5s';
    setTimeout(() => indicator.remove(), 500);
  }, 5000);
}

// Initialize
async function init() {
  console.log('🚀 Initializing...');

  try {
    // Wait for body
    if (!document.body) {
      console.log('⏳ Waiting for body...');
      setTimeout(init, 100);
      return;
    }

    // Show indicator
    showTestIndicator();

    // Load config
    const savedConfig = await storage.get<ExtensionConfig>('ai_translate_config');
    if (savedConfig) {
      config = savedConfig;
      console.log('✅ Config loaded');
    }

    // Initialize translation engine
    if (config.api.apiKey) {
      translationEngine = new TranslationEngine(config.api.apiKey, config.api.model);
      console.log('✅ Translation engine initialized');
    } else {
      console.warn('⚠️ No API key set');
    }

    // Setup event listeners
    setupListeners();

    console.log('✅ Initialization complete!');
    console.log('💡 Hover over text and press Shift to translate');

  } catch (error) {
    console.error('❌ Init error:', error);
  }
}

// Setup event listeners
function setupListeners() {
  console.log('🎧 Setting up listeners...');

  // Track Shift key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !isShiftPressed) {
      isShiftPressed = true;
      console.log('⌨️ Shift pressed');

      // Translate if hovering
      if (currentElement && translationEngine) {
        console.log('🎯 Translating...');
        translateNow(currentElement);
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShiftPressed = false;
      console.log('⌨️ Shift released');
    }
  });

  // Track mouse hover
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    const text = target.textContent?.trim();

    // Check if element has translatable text
    if (text && text.length >= 10 && text.length <= 2000) {
      // Remove highlight from previous element
      if (currentElement && currentElement !== target) {
        currentElement.classList.remove('ai-translate-highlight');
      }

      currentElement = target;
      currentElement.classList.add('ai-translate-highlight');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    target.classList.remove('ai-translate-highlight');
    if (target === currentElement) {
      currentElement = null;
    }
  });

  console.log('✅ Listeners ready');
}

// Translate function
async function translateNow(element: HTMLElement) {
  if (!translationEngine) {
    console.warn('⚠️ No translation engine');
    showError(element, '请先设置API Key');
    return;
  }

  const text = element.textContent?.trim();
  if (!text || text.length < 10) {
    console.warn('⚠️ Text too short:', text?.length);
    return;
  }

  console.log('📝 Translating:', text.substring(0, 50) + '...');

  // Show loading
  element.classList.add('ai-translate-loading');

  try {
    // Translate
    const result = await translationEngine.translate(text, {
      from: config.translation.sourceLanguage,
      to: config.translation.targetLanguage,
    });

    // Hide loading
    element.classList.remove('ai-translate-loading');

    // Show result
    showTranslation(element, result.translatedText);
    console.log('✅ Translation complete');

  } catch (error) {
    console.error('❌ Translation error:', error);
    element.classList.remove('ai-translate-loading');
    showError(element, '翻译失败：' + (error as Error).message);
  }
}

// Show translation
function showTranslation(element: HTMLElement, translation: string) {
  // Remove existing translation
  let existing = element.nextElementSibling;
  if (existing && existing.classList.contains('ai-translate-result')) {
    existing.remove();
  }

  // Create translation container
  const div = document.createElement('div');
  div.className = 'ai-translate-result';

  // Escape HTML
  const escapedText = translation
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  div.innerHTML = `
    <div style="font-weight:600; margin-bottom:8px; color:#667eea;">
      🌐 AI翻译
    </div>
    <div>${escapedText}</div>
  `;

  // Insert after element
  if (element.parentNode) {
    element.parentNode.insertBefore(div, element.nextSibling);
  }

  // Scroll into view
  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show error
function showError(element: HTMLElement, message: string) {
  const div = document.createElement('div');
  div.className = 'ai-translate-result';
  div.style.borderLeftColor = '#e74c3c';
  div.textContent = '❌ ' + message;

  if (element.parentNode) {
    element.parentNode.insertBefore(div, element.nextSibling);
  }

  setTimeout(() => div.remove(), 3000);
}

// Start
console.log('⏳ Waiting to initialize...');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('🌐 Content script loaded');
