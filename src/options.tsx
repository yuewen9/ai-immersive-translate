/**
 * Options component - settings page
 */

import { useState, useEffect } from 'react';
import { Storage } from '@plasmohq/storage';
import { ExtensionConfig, RenderMode } from './types';
import { DEFAULT_CONFIG, SUPPORTED_LANGUAGES } from './lib/constants';
import './style.css';

const storage = new Storage();

function IndexOptions() {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    loadConfig();
    loadCacheSize();
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

  const loadCacheSize = async () => {
    try {
      const cache = await storage.get('ai_translate_cache');
      if (cache && Array.isArray(cache)) {
        setCacheSize(cache.length);
      }
    } catch (error) {
      console.error('Failed to load cache size:', error);
    }
  };

  const saveConfig = async (newConfig: ExtensionConfig) => {
    setSaveStatus('saving');
    try {
      await storage.set('ai_translate_config', newConfig);
      setConfig(newConfig);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear the translation cache?')) {
      try {
        await storage.remove('ai_translate_cache');
        setCacheSize(0);
        alert('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('Failed to clear cache');
      }
    }
  };

  const updateConfig = (updates: Partial<ExtensionConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>⚙️ AI Immersive Translate Settings</h1>
        <p className="version">v0.0.3</p>
      </header>

      <main className="options-content">
        {/* API Settings */}
        <section className="settings-section">
          <h2>🔑 API Configuration</h2>

          <div className="form-group">
            <label htmlFor="apiKey">BigModel API Key</label>
            <input
              type="password"
              id="apiKey"
              value={config.api.apiKey}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  api: { ...config.api, apiKey: e.target.value }
                })
              }
              placeholder="Enter your BigModel API key"
            />
            <p className="help-text">
              Get your API key from{' '}
              <a
                href="https://open.bigmodel.cn/"
                target="_blank"
                rel="noopener noreferrer"
              >
                open.bigmodel.cn
              </a>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={config.api.model}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  api: { ...config.api, model: e.target.value }
                })
              }
            >
              <option value="glm-4">GLM-4</option>
              <option value="glm-3-turbo">GLM-3 Turbo</option>
            </select>
          </div>
        </section>

        {/* Translation Settings */}
        <section className="settings-section">
          <h2>🌐 Translation Settings</h2>

          <div className="form-group">
            <label htmlFor="sourceLanguage">Source Language</label>
            <select
              id="sourceLanguage"
              value={config.translation.sourceLanguage}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  translation: {
                    ...config.translation,
                    sourceLanguage: e.target.value
                  }
                })
              }
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetLanguage">Target Language</label>
            <select
              id="targetLanguage"
              value={config.translation.targetLanguage}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  translation: {
                    ...config.translation,
                    targetLanguage: e.target.value
                  }
                })
              }
            >
              {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.translation.autoTranslate}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    translation: {
                      ...config.translation,
                      autoTranslate: e.target.checked
                    }
                  })
                }
              />
              <span>Auto-translate on page load</span>
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.translation.translateOnHover}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    translation: {
                      ...config.translation,
                      translateOnHover: e.target.checked
                    }
                  })
                  }
              />
              <span>Translate on hover</span>
            </label>
          </div>
        </section>

        {/* Display Settings */}
        <section className="settings-section">
          <h2>🎨 Display Settings</h2>

          <div className="form-group">
            <label htmlFor="displayMode">Display Mode</label>
            <select
              id="displayMode"
              value={config.display.mode}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  display: {
                    ...config.display,
                    mode: e.target.value as RenderMode
                  }
                })
              }
            >
              <option value="hover">Hover (default)</option>
              <option value="side-by-side">Side by Side</option>
              <option value="top-bottom">Top and Bottom</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fontSize">Font Size: {config.display.fontSize}px</label>
            <input
              type="range"
              id="fontSize"
              min="10"
              max="24"
              value={config.display.fontSize}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  display: {
                    ...config.display,
                    fontSize: parseInt(e.target.value)
                  }
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="fontFamily">Font Family</label>
            <select
              id="fontFamily"
              value={config.display.fontFamily}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  display: {
                    ...config.display,
                    fontFamily: e.target.value
                  }
                })
              }
            >
              <option value="system-ui">System UI</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
        </section>

        {/* Advanced Settings */}
        <section className="settings-section">
          <h2>🔧 Advanced Settings</h2>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.advanced.cacheEnabled}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    advanced: {
                      ...config.advanced,
                      cacheEnabled: e.target.checked
                    }
                  })
                  }
              />
              <span>Enable cache</span>
            </label>
          </div>

          <div className="form-group">
            <label>Cache Information</label>
            <p className="cache-info">
              Cached translations: {cacheSize}
            </p>
            <button className="secondary-button" onClick={handleClearCache}>
              Clear Cache
            </button>
          </div>
        </section>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && '✅ Settings saved successfully'}
            {saveStatus === 'error' && '❌ Failed to save settings'}
          </div>
        )}
      </main>

      <footer className="options-footer">
        <p>
          AI Immersive Translate v0.0.3 |{' '}
          <a
            href="https://github.com/yourusername/ai-immersive-translate"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default IndexOptions;
