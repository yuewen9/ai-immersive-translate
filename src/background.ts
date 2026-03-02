/**
 * Background script for AI Immersive Translate
 */

import { Storage } from '@plasmohq/storage';
import { ExtensionConfig } from './types/index';
import { DEFAULT_CONFIG } from './lib/constants';

const storage = new Storage();

// Initialize default config on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('AI Immersive Translate installed');

    // Set default config
    await storage.set('ai_translate_config', DEFAULT_CONFIG);

    // Initialize statistics
    await storage.set('ai_translate_statistics', {
      translationsCount: 0,
      charactersCount: 0,
      apiCost: 0,
      date: new Date().toISOString().split('T')[0],
    });

    // Open welcome page
    await chrome.tabs.create({
      url: chrome.runtime.getURL('tabs/options.html'),
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_CONFIG':
      storage.get('ai_translate_config').then((config) => {
        sendResponse(config || DEFAULT_CONFIG);
      });
      return true;

    case 'UPDATE_CONFIG':
      storage.set('ai_translate_config', message.payload).then(() => {
        sendResponse({ success: true });
      });
      return true;

    case 'CLEAR_CACHE':
      storage.remove('ai_translate_cache').then(() => {
        sendResponse({ success: true });
      });
      return true;

    case 'GET_STATISTICS':
      storage.get('ai_translate_statistics').then((stats) => {
        sendResponse(stats || {});
      });
      return true;
  }

  return false;
});

// Handle context menu (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate-selection',
    title: 'Translate with AI Immersive Translate',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-selection' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'TRANSLATE_SELECTION',
      payload: {
        text: info.selectionText,
      },
    });
  }
});

console.log('AI Immersive Translate background script loaded');
