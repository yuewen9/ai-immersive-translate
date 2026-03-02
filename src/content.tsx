import { TextExtractor } from "./core/extractor/TextExtractor"
import { DEFAULT_CONFIG, MAX_TEXT_LENGTH } from "./lib/constants"
import { mergeConfig, STORAGE_KEYS } from "./lib/config"
import { getLocalStorageValue } from "./lib/storage"
import { ExtensionConfig, TranslationResult } from "./types"

const extractor = new TextExtractor()

class HoverTranslateController {
  private config: ExtensionConfig = DEFAULT_CONFIG
  private tooltip: HTMLDivElement | null = null
  private tooltipOriginal: HTMLDivElement | null = null
  private tooltipTranslation: HTMLDivElement | null = null
  private hoveredElement: HTMLElement | null = null
  private hoveredText = ""
  private shiftPressed = false
  private debounceTimer: number | null = null
  private activeRequestId = 0
  private inflightRequests = new Map<string, Promise<TranslationResult>>()

  async init() {
    await this.loadConfig()
    this.createTooltip()
    this.registerListeners()

    if (this.config.translation.autoTranslate) {
      this.translateCurrentHover()
    }
  }

  private async loadConfig() {
    try {
      const savedConfig = await getLocalStorageValue<ExtensionConfig>(STORAGE_KEYS.CONFIG)
      this.config = mergeConfig(savedConfig)
    } catch (error) {
      console.error("Failed to load extension config:", error)
      this.config = DEFAULT_CONFIG
    }

  }

  private registerListeners() {
    document.addEventListener("keydown", this.handleKeyDown, true)
    document.addEventListener("keyup", this.handleKeyUp, true)
    document.addEventListener("mouseover", this.handleMouseOver, true)
    document.addEventListener("mouseout", this.handleMouseOut, true)
    window.addEventListener("scroll", this.handleViewportChange, true)
    window.addEventListener("resize", this.handleViewportChange, true)

    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === "TRANSLATE_PAGE") {
        this.translateCurrentHover(true)
      }
    })

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes[STORAGE_KEYS.CONFIG]) {
        return
      }

      const nextConfig = changes[STORAGE_KEYS.CONFIG].newValue as ExtensionConfig | undefined
      this.config = mergeConfig(nextConfig)
    })
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Shift" || this.shiftPressed) {
      return
    }

    this.shiftPressed = true
    this.translateCurrentHover()
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key !== "Shift") {
      return
    }

    this.shiftPressed = false
    this.clearHighlight()
    this.hideTooltip()
  }

  private handleMouseOver = (event: MouseEvent) => {
    const element = this.getTargetElement(event.target)
    if (!element) {
      return
    }

    const text = this.getElementText(element)
    if (!text) {
      return
    }

    this.hoveredElement = element
    this.hoveredText = text

    if (this.shiftPressed && this.config.translation.translateOnHover) {
      this.translateCurrentHover()
    }
  }

  private handleMouseOut = (event: MouseEvent) => {
    const target = this.getTargetElement(event.target)
    if (!target || target !== this.hoveredElement) {
      return
    }

    const nextTarget = this.getTargetElement(event.relatedTarget)
    if (nextTarget && nextTarget === this.hoveredElement) {
      return
    }

    this.clearHighlight()
    this.hoveredElement = null
    this.hoveredText = ""
    this.hideTooltip()
  }

  private handleViewportChange = () => {
    if (!this.hoveredElement || !this.tooltip || this.tooltip.hidden) {
      return
    }

    this.positionTooltip(this.hoveredElement)
  }

  private getTargetElement(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof HTMLElement)) {
      return null
    }

    if (target.closest(".ai-immersive-tooltip")) {
      return null
    }

    return target
  }

  private getElementText(element: HTMLElement): string {
    if (extractor.shouldExclude(element)) {
      return ""
    }

    const text = element.innerText?.trim() || element.textContent?.trim() || ""
    if (!text) {
      return ""
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return text.slice(0, MAX_TEXT_LENGTH)
    }

    return text
  }

  private translateCurrentHover(force = false) {
    if (!this.hoveredElement || !this.hoveredText || !this.shiftPressed && !force) {
      return
    }

    if (!this.config.translation.translateOnHover && !force) {
      return
    }

    if (!this.config.api.apiKey) {
      this.showTooltip(this.hoveredElement, "请先在设置中填写 API Key。")
      return
    }

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      void this.translateHoveredText()
    }, 250)
  }

  private async translateHoveredText() {
    if (!this.hoveredElement || !this.hoveredText || !this.config.api.apiKey) {
      return
    }

    const element = this.hoveredElement
    const text = this.hoveredText
    const requestId = ++this.activeRequestId

    this.applyHighlight(element)
    this.showTooltip(element, "Translating...", text)

    try {
      const result = await this.getOrCreateTranslation(text)

      if (requestId !== this.activeRequestId || element !== this.hoveredElement) {
        return
      }

      this.showTooltip(element, result.translatedText, text)
    } catch (error) {
      console.error("Failed to translate hovered text:", error)

      if (requestId !== this.activeRequestId || element !== this.hoveredElement) {
        return
      }

      this.showTooltip(element, this.getErrorMessage(error), text)
    }
  }

  private async getOrCreateTranslation(text: string): Promise<TranslationResult> {
    const options = {
      from: this.config.translation.sourceLanguage,
      to: this.config.translation.targetLanguage
    }

    const cacheKey = [
      this.config.api.provider,
      this.config.api.model,
      options.from,
      options.to,
      text.replace(/\s+/g, " ").trim()
    ].join("::")
    const pendingRequest = this.inflightRequests.get(cacheKey)

    if (pendingRequest) {
      return pendingRequest
    }

    const request = this.requestTranslation(text, options).finally(() => {
      this.inflightRequests.delete(cacheKey)
    })

    this.inflightRequests.set(cacheKey, request)
    return request
  }

  private async requestTranslation(
    text: string,
    options: { from: string; to: string }
  ): Promise<TranslationResult> {
    return new Promise<TranslationResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error("Background translation request timed out. Reload the extension and page."))
      }, 15000)

      chrome.runtime.sendMessage(
        {
          type: "TRANSLATE_TEXT",
          payload: {
            text,
            options
          }
        },
        (response) => {
          window.clearTimeout(timeoutId)

          const runtimeError = chrome.runtime.lastError
          if (runtimeError) {
            reject(new Error(runtimeError.message || "Extension messaging failed"))
            return
          }

          if (!response?.success) {
            reject(new Error(response?.error || "Unknown translation error"))
            return
          }

          resolve(response.result as TranslationResult)
        }
      )
    })
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return "Translation failed. Check your API key or network."
    }

    if (error.message.includes("401")) {
      return "API key invalid or expired."
    }

    if (error.message.includes("429")) {
      return "Rate limited by API provider. Try again shortly."
    }

    if (error.message.includes("Failed to fetch")) {
      return "Network request failed. Check extension network access."
    }

    if (error.message.includes("timed out")) {
      return "Background request timed out. Refresh the extension and page."
    }

    if (error.message.includes("Receiving end does not exist")) {
      return "Extension was reloaded. Refresh this page and try again."
    }

    if (error.message.includes("API key is not set")) {
      return "Please set your API key in Settings."
    }

    return error.message
  }

  private createTooltip() {
    if (this.tooltip) {
      return
    }

    const tooltip = document.createElement("div")
    tooltip.className = "ai-immersive-tooltip"
    tooltip.hidden = true

    const original = document.createElement("div")
    original.className = "ai-immersive-tooltip__original"

    const translation = document.createElement("div")
    translation.className = "ai-immersive-tooltip__translation"

    tooltip.appendChild(original)
    tooltip.appendChild(translation)
    document.documentElement.appendChild(tooltip)

    const style = document.createElement("style")
    style.id = "ai-immersive-tooltip-style"
    style.textContent = `
      .ai-immersive-tooltip {
        position: absolute;
        z-index: 2147483647;
        max-width: min(420px, calc(100vw - 24px));
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(15, 23, 42, 0.16);
        background: rgba(255, 255, 255, 0.98);
        color: #0f172a;
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(12px);
        pointer-events: none;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .ai-immersive-tooltip__original {
        margin-bottom: 8px;
        font-size: 12px;
        color: #475569;
      }

      .ai-immersive-tooltip__translation {
        font-size: 14px;
        line-height: 1.6;
        color: #0f172a;
      }

      .ai-immersive-highlight {
        outline: 2px solid rgba(37, 99, 235, 0.45);
        outline-offset: 2px;
      }
    `

    document.head.appendChild(style)

    this.tooltip = tooltip
    this.tooltipOriginal = original
    this.tooltipTranslation = translation
  }

  private showTooltip(element: HTMLElement, translation: string, originalText = "") {
    if (!this.tooltip || !this.tooltipOriginal || !this.tooltipTranslation) {
      return
    }

    this.tooltipOriginal.textContent = originalText
    this.tooltipOriginal.hidden = !originalText
    this.tooltipTranslation.textContent = translation
    this.tooltip.hidden = false
    this.positionTooltip(element)
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.hidden = true
    }
  }

  private positionTooltip(element: HTMLElement) {
    if (!this.tooltip) {
      return
    }

    const rect = element.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const margin = 10

    const tooltipWidth = this.tooltip.offsetWidth || 320
    const tooltipHeight = this.tooltip.offsetHeight || 80

    let top = rect.bottom + scrollY + margin
    let left = rect.left + scrollX

    if (left + tooltipWidth > scrollX + window.innerWidth - margin) {
      left = scrollX + window.innerWidth - tooltipWidth - margin
    }

    if (left < scrollX + margin) {
      left = scrollX + margin
    }

    if (top + tooltipHeight > scrollY + window.innerHeight - margin) {
      top = rect.top + scrollY - tooltipHeight - margin
    }

    if (top < scrollY + margin) {
      top = scrollY + margin
    }

    this.tooltip.style.left = `${left}px`
    this.tooltip.style.top = `${top}px`
  }

  private applyHighlight(element: HTMLElement) {
    this.clearHighlight()
    element.classList.add("ai-immersive-highlight")
  }

  private clearHighlight() {
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove("ai-immersive-highlight")
    }
  }
}

const controller = new HoverTranslateController()
void controller.init()
