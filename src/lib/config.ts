import { DEFAULT_CONFIG, STORAGE_KEYS } from "./constants"
import { ExtensionConfig } from "../types"

export const mergeConfig = (savedConfig?: Partial<ExtensionConfig>): ExtensionConfig => ({
  ...DEFAULT_CONFIG,
  ...savedConfig,
  api: {
    ...DEFAULT_CONFIG.api,
    ...savedConfig?.api
  },
  translation: {
    ...DEFAULT_CONFIG.translation,
    ...savedConfig?.translation
  },
  display: {
    ...DEFAULT_CONFIG.display,
    ...savedConfig?.display
  },
  advanced: {
    ...DEFAULT_CONFIG.advanced,
    ...savedConfig?.advanced
  }
})

export { STORAGE_KEYS }
