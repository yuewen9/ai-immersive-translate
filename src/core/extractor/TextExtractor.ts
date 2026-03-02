/**
 * Text extraction from web pages
 */

import { TranslationUnit } from '../../types';
import { EXCLUDED_SELECTORS, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from '../../lib/constants';
import { generateId, isTranslatableText } from '../../lib/utils';

export class TextExtractor {
  /**
   * Extract main content from page
   */
  extractMainContent(): TranslationUnit[] {
    const units: TranslationUnit[] = [];
    const body = document.body;

    if (!body) return units;

    // Get all text nodes
    const walker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          // Check if parent or any ancestor should be excluded
          if (this.shouldExclude(parent)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Check if text is translatable
          const text = node.textContent?.trim();
          if (!text || !isTranslatableText(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim();
      if (!text) continue;

      // Truncate if too long
      const truncatedText = text.length > MAX_TEXT_LENGTH
        ? text.substring(0, MAX_TEXT_LENGTH)
        : text;

      const element = node.parentElement;
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const unit: TranslationUnit = {
        id: generateId(),
        originalText: truncatedText,
        element,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        },
      };

      units.push(unit);
    }

    return units;
  }

  /**
   * Extract selected text
   */
  extractSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString() || '';
  }

  /**
   * Check if element should be excluded
   */
  shouldExclude(element: HTMLElement): boolean {
    // Check direct selectors
    for (const selector of EXCLUDED_SELECTORS) {
      try {
        if (element.matches(selector)) {
          return true;
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    // Check parents
    let parent = element.parentElement;
    while (parent) {
      for (const selector of EXCLUDED_SELECTORS) {
        try {
          if (parent.matches(selector)) {
            return true;
          }
        } catch (e) {
          // Invalid selector, skip
        }
      }
      parent = parent.parentElement;
    }

    // Check data attribute
    if (element.dataset.translate === 'false') {
      return true;
    }

    // Check class names
    if (element.classList.contains('no-translate')) {
      return true;
    }

    return false;
  }

  /**
   * Extract text from specific element
   */
  extractFromElement(element: HTMLElement): TranslationUnit[] {
    const units: TranslationUnit[] = [];
    const text = element.textContent?.trim();

    if (!text || !isTranslatableText(text)) {
      return units;
    }

    const rect = element.getBoundingClientRect();
    const unit: TranslationUnit = {
      id: generateId(),
      originalText: text,
      element,
      position: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      },
    };

    units.push(unit);
    return units;
  }

  /**
   * Get visible text elements
   */
  getVisibleElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      // Check if element is visible
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      // Check if element should be excluded
      if (this.shouldExclude(element)) return;

      elements.push(element);
    });

    return elements;
  }
}
