/**
 * Popup component - extension popup interface
 */

import { useState, useEffect } from 'react';
import { Storage } from '@plasmohq/storage';
import { ExtensionConfig } from './types';
import { DEFAULT_CONFIG } from './lib/constants';
import './style.css';

const storage = new Storage();

function IndexPopup() {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedCount, setTranslatedCount] = useState(0);

  useEffect(() => {
    loadConfig();
    loadStatistics();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await storage.get<ExtensionConfig>('ai_translate_config');
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await storage.get('ai_translate_statistics');
      if (stats && typeof stats === 'object' && 'translationsCount' in stats) {
        setTranslatedCount((stats as any).translationsCount || 0);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleTranslatePage = async () => {
    if (!config.api.apiKey) {
      alert('Please set your BigModel API key in settings first');
      return;
    }

    setIsTranslating(true);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TRANSLATE_PAGE' });
        alert('Translation started! Please wait...');
      }
    } catch (error) {
      console.error('Failed to translate page:', error);
      alert('Failed to translate page. Make sure you are on a valid web page.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>🌐 AI Immersive Translate</h1>
        <p className="version">v0.0.1</p>
      </header>

      <div className="popup-content">
        <div className="status-card">
          <div className="status-icon">
            {config.api.apiKey ? '✅' : '⚠️'}
          </div>
          <div className="status-text">
            <p className="status-title">
              {config.api.apiKey ? 'Ready to translate' : 'API Key required'}
            </p>
            <p className="status-count">{translatedCount} paragraphs translated</p>
          </div>
        </div>

        <div style={{
          background: '#f0f4ff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '2px dashed #667eea'
        }}>
          <p style={{ fontSize: '14px', color: '#333', marginBottom: '0.5rem', fontWeight: '600' }}>
            💡 使用方法
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            鼠标悬停在文本上，按住 <kbd style={{ background: '#667eea', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Shift</kbd> 键即可翻译！
          </p>
        </div>

        <button
          className="translate-button"
          onClick={handleTranslatePage}
          disabled={isTranslating || !config.api.apiKey}
          style={{ display: 'none' }} // 隐藏整页翻译按钮
        >
          {isTranslating ? '⏳ Translating...' : '🚀 Translate this page'}
        </button>

        <div className="settings-preview">
          <div className="setting-item">
            <span className="setting-label">Target Language:</span>
            <span className="setting-value">{config.translation.targetLanguage}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">API Provider:</span>
            <span className="setting-value">{config.api.provider}</span>
          </div>
        </div>

        <button className="settings-button" onClick={handleOpenSettings}>
          ⚙️ Settings
        </button>
      </div>

      <footer className="popup-footer">
        <p>Powered by BigModel API</p>
      </footer>
    </div>
  );
}

export default IndexPopup;
