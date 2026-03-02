/**
 * Bilingual rendering engine
 */

import { TranslationUnit, RenderMode } from '../../types';

export class BilingualRenderer {
  private mode: RenderMode;
  private fontSize: number;
  private fontFamily: string;
  private textColor: string;
  private highlightColor: string;
  private injectedElements: Map<string, HTMLElement> = new Map();

  constructor(config: {
    mode: RenderMode;
    fontSize: number;
    fontFamily: string;
    textColor: string;
    highlightColor: string;
  }) {
    this.mode = config.mode;
    this.fontSize = config.fontSize;
    this.fontFamily = config.fontFamily;
    this.textColor = config.textColor;
    this.highlightColor = config.highlightColor;
  }

  /**
   * Inject CSS styles
   */
  injectStyles(): void {
    const styleId = 'ai-immersive-translate-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ai-translate-container {
        font-family: ${this.fontFamily};
        font-size: ${this.fontSize}px;
        color: ${this.textColor};
        line-height: 1.6;
      }

      .ai-translate-side-by-side {
        display: flex;
        gap: 1rem;
        margin: 0.5rem 0;
      }

      .ai-translate-original {
        flex: 1;
      }

      .ai-translate-translation {
        flex: 1;
        background-color: ${this.highlightColor};
        padding: 0.5rem;
        border-radius: 4px;
      }

      .ai-translate-top-bottom {
        margin: 0.5rem 0;
      }

      .ai-translate-top-bottom .ai-translate-translation {
        background-color: ${this.highlightColor};
        padding: 0.5rem;
        border-radius: 4px;
        margin-top: 0.25rem;
      }

      .ai-translate-hover-trigger {
        position: relative;
        cursor: pointer;
        border-bottom: 1px dashed ${this.textColor};
      }

      .ai-translate-hover-tooltip {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 0.75rem;
        border-radius: 4px;
        max-width: 400px;
        z-index: 10000;
        font-size: ${this.fontSize}px;
        background-color: ${this.highlightColor};
      }

      .ai-translate-float-button {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        background: #fff;
        border: 2px solid #333;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        transition: transform 0.2s;
      }

      .ai-translate-float-button:hover {
        transform: scale(1.1);
      }

      .ai-translate-progress {
        position: fixed;
        bottom: 5rem;
        right: 2rem;
        background: #333;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 12px;
        z-index: 9998;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Render translation for a unit
   */
  renderTranslation(unit: TranslationUnit, translatedText: string): void {
    // Remove existing translation if any
    this.removeTranslation(unit.id);

    const element = unit.element;

    switch (this.mode) {
      case 'side-by-side':
        this.renderSideBySide(element, unit.originalText, translatedText);
        break;
      case 'top-bottom':
        this.renderTopBottom(element, unit.originalText, translatedText);
        break;
      case 'hover':
        this.renderHover(element, unit.originalText, translatedText);
        break;
    }
  }

  /**
   * Render side by side mode
   */
  private renderSideBySide(
    element: HTMLElement,
    original: string,
    translation: string
  ): void {
    const container = document.createElement('div');
    container.className = 'ai-translate-container ai-translate-side-by-side';

    const originalDiv = document.createElement('div');
    originalDiv.className = 'ai-translate-original';
    originalDiv.textContent = original;

    const translationDiv = document.createElement('div');
    translationDiv.className = 'ai-translate-translation';
    translationDiv.textContent = translation;

    container.appendChild(originalDiv);
    container.appendChild(translationDiv);

    element.replaceWith(container);
    this.injectedElements.set(element.textContent || '', container);
  }

  /**
   * Render top bottom mode
   */
  private renderTopBottom(
    element: HTMLElement,
    original: string,
    translation: string
  ): void {
    const container = document.createElement('div');
    container.className = 'ai-translate-container ai-translate-top-bottom';

    const originalDiv = document.createElement('div');
    originalDiv.className = 'ai-translate-original';
    originalDiv.textContent = original;

    const translationDiv = document.createElement('div');
    translationDiv.className = 'ai-translate-translation';
    translationDiv.textContent = translation;

    container.appendChild(originalDiv);
    container.appendChild(translationDiv);

    element.replaceWith(container);
    this.injectedElements.set(element.textContent || '', container);
  }

  /**
   * Render hover mode
   */
  private renderHover(
    element: HTMLElement,
    original: string,
    translation: string
  ): void {
    const span = document.createElement('span');
    span.className = 'ai-translate-hover-trigger';
    span.textContent = original;

    const tooltip = document.createElement('div');
    tooltip.className = 'ai-translate-hover-tooltip';
    tooltip.textContent = translation;
    tooltip.style.display = 'none';

    span.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
      const rect = span.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      tooltip.style.left = `${rect.left + window.scrollX}px`;
    });

    span.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    element.replaceWith(span);
    span.appendChild(tooltip);
    this.injectedElements.set(original, span);
  }

  /**
   * Remove translation
   */
  removeTranslation(id: string): void {
    const element = this.injectedElements.get(id);
    if (element) {
      element.remove();
      this.injectedElements.delete(id);
    }
  }

  /**
   * Clear all translations
   */
  clearAll(): void {
    this.injectedElements.forEach((element) => {
      element.remove();
    });
    this.injectedElements.clear();
  }

  /**
   * Create float button
   */
  createFloatButton(onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.className = 'ai-translate-float-button';
    button.textContent = '🌐';
    button.title = 'AI Translate';
    button.addEventListener('click', onClick);
    document.body.appendChild(button);
    return button;
  }

  /**
   * Update progress indicator
   */
  updateProgress(current: number, total: number): void {
    let progress = document.querySelector('.ai-translate-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'ai-translate-progress';
      document.body.appendChild(progress);
    }
    (progress as HTMLElement).textContent = `Translating: ${current}/${total}`;
  }

  /**
   * Hide progress indicator
   */
  hideProgress(): void {
    const progress = document.querySelector('.ai-translate-progress');
    if (progress) {
      progress.remove();
    }
  }
}
