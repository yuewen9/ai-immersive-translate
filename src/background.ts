import { API_PROVIDER_MAP, DEFAULT_CONFIG } from "./lib/constants"
import { ExtensionConfig, TranslationOptions, TranslationResult } from "./types"

const STORAGE_KEYS = {
  CONFIG: "ai_translate_config",
  CACHE: "ai_translate_cache",
  STATISTICS: "ai_translate_statistics"
} as const

type Statistics = {
  translationsCount: number
  charactersCount: number
  apiCost: number
  date: string
}

type CacheEntry = {
  key: string
  result: TranslationResult
  timestamp: number
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000
const MIN_REQUEST_INTERVAL = 1500
const DEFAULT_RATE_LIMIT_COOLDOWN = 15000

let lastRequestTime = 0
let rateLimitedUntil = 0
const inflightTranslations = new Map<string, Promise<TranslationResult>>()

const getStorage = async <T>(key: string): Promise<T | undefined> => {
  const result = await chrome.storage.local.get(key)
  return result[key] as T | undefined
}

const setStorage = async (key: string, value: unknown) => {
  await chrome.storage.local.set({ [key]: value })
}

const removeStorage = async (key: string) => {
  await chrome.storage.local.remove(key)
}

const mergeConfig = (savedConfig?: Partial<ExtensionConfig>): ExtensionConfig => ({
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

const generateHash = (text: string) => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash &= hash
  }
  return Math.abs(hash).toString(36)
}

const getLanguageName = (code: string) =>
  (
    {
      en: "English",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ar: "Arabic",
      hi: "Hindi"
    } as Record<string, string>
  )[code] || code

const getCacheKey = (
  provider: ExtensionConfig["api"]["provider"],
  model: string,
  text: string,
  from: string,
  to: string
) => {
  const normalizedText = text.replace(/\s+/g, " ").trim()
  return `${provider}-${model}-${from}-${to}-${generateHash(normalizedText)}`
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const loadCache = async (): Promise<CacheEntry[]> => {
  const cache = await getStorage<CacheEntry[]>(STORAGE_KEYS.CACHE)
  return Array.isArray(cache) ? cache : []
}

const getCachedTranslation = async (text: string, from: string, to: string) => {
  const config = mergeConfig(await getStorage<ExtensionConfig>(STORAGE_KEYS.CONFIG))
  const key = getCacheKey(config.api.provider, config.api.model, text, from, to)
  const now = Date.now()
  const cache = await loadCache()
  const validCache = cache.filter((entry) => now - entry.timestamp < CACHE_DURATION)
  const hit = validCache.find((entry) => entry.key === key)

  if (validCache.length !== cache.length) {
    await setStorage(STORAGE_KEYS.CACHE, validCache)
  }

  return hit?.result || null
}

const saveCachedTranslation = async (
  text: string,
  from: string,
  to: string,
  result: TranslationResult
) => {
  const config = mergeConfig(await getStorage<ExtensionConfig>(STORAGE_KEYS.CONFIG))
  const key = getCacheKey(config.api.provider, config.api.model, text, from, to)
  const cache = await loadCache()
  const nextCache = cache
    .filter((entry) => entry.key !== key)
    .concat([{ key, result, timestamp: Date.now() }])

  await setStorage(STORAGE_KEYS.CACHE, nextCache)
}

const updateStatistics = async (text: string) => {
  const stats =
    (await getStorage<Partial<Statistics>>(STORAGE_KEYS.STATISTICS)) || {}

  await setStorage(STORAGE_KEYS.STATISTICS, {
    translationsCount: (stats.translationsCount || 0) + 1,
    charactersCount: (stats.charactersCount || 0) + text.length,
    apiCost: stats.apiCost || 0,
    date: new Date().toISOString().split("T")[0]
  })
}

const translateText = async (
  text: string,
  options: TranslationOptions
): Promise<TranslationResult> => {
  const config = mergeConfig(await getStorage<ExtensionConfig>(STORAGE_KEYS.CONFIG))
  const cacheKey = getCacheKey(config.api.provider, config.api.model, text, options.from, options.to)
  const inflightRequest = inflightTranslations.get(cacheKey)

  if (inflightRequest) {
    return inflightRequest
  }

  const request = performTranslation(text, options).finally(() => {
    inflightTranslations.delete(cacheKey)
  })

  inflightTranslations.set(cacheKey, request)
  return request
}

const performTranslation = async (
  text: string,
  options: TranslationOptions
): Promise<TranslationResult> => {
  const config = mergeConfig(await getStorage<ExtensionConfig>(STORAGE_KEYS.CONFIG))
  const providerConfig = API_PROVIDER_MAP[config.api.provider]

  if (!config.api.apiKey) {
    throw new Error("API key is not set")
  }

  if (!providerConfig) {
    throw new Error(`Unsupported API provider: ${config.api.provider}`)
  }

  const cached = await getCachedTranslation(text, options.from, options.to)
  if (cached) {
    return cached
  }

  const now = Date.now()
  if (now < rateLimitedUntil) {
    const retrySeconds = Math.ceil((rateLimitedUntil - now) / 1000)
      throw new Error(`${providerConfig.label} rate limit active. Try again in ${retrySeconds}s.`)
  }

  const waitTime = MIN_REQUEST_INTERVAL - (now - lastRequestTime)
  if (waitTime > 0) {
    await sleep(waitTime)
  }

  const targetLang = getLanguageName(options.to)
  const sourceLang =
    options.from === "auto" ? "detected language" : getLanguageName(options.from)

  const prompt =
    options.from === "auto"
      ? `Detect the language and translate the following text to ${targetLang}. Only provide the translation, no explanations:\n\n${text}`
      : `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation, no explanations:\n\n${text}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(providerConfig.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.api.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.api.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options.temperature ?? 0.3,
        max_tokens: 2000
      }),
      signal: controller.signal
    })

    lastRequestTime = Date.now()

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("retry-after")
        const retryAfterMs = retryAfterHeader
          ? Number.parseInt(retryAfterHeader, 10) * 1000
          : DEFAULT_RATE_LIMIT_COOLDOWN

        rateLimitedUntil = Date.now() + (Number.isFinite(retryAfterMs) ? retryAfterMs : DEFAULT_RATE_LIMIT_COOLDOWN)
        throw new Error(
          `${providerConfig.label} rate limited. Try again in ${Math.ceil((rateLimitedUntil - Date.now()) / 1000)}s.`
        )
      }

      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const translatedText = data?.choices?.[0]?.message?.content?.trim()

    if (!translatedText) {
      throw new Error("Invalid API response format")
    }

    const result: TranslationResult = {
      originalText: text,
      translatedText,
      sourceLanguage: options.from,
      targetLanguage: options.to,
      model: config.api.model,
      timestamp: Date.now()
    }

    await saveCachedTranslation(text, options.from, options.to, result)
    await updateStatistics(text)
    return result
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${providerConfig.label} request timed out`)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await setStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG)
    await setStorage(STORAGE_KEYS.STATISTICS, {
      translationsCount: 0,
      charactersCount: 0,
      apiCost: 0,
      date: new Date().toISOString().split("T")[0]
    } satisfies Statistics)

    await chrome.tabs.create({
      url: chrome.runtime.getURL("options.html")
    })
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message?.type) {
    case "TRANSLATE_TEXT":
      void translateText(message.payload.text, message.payload.options)
        .then((result) => sendResponse({ success: true, result }))
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown translation error"
          })
        )
      return true

    case "GET_CONFIG":
      void getStorage<ExtensionConfig>(STORAGE_KEYS.CONFIG).then((config) =>
        sendResponse(mergeConfig(config))
      )
      return true

    case "UPDATE_CONFIG":
      void setStorage(STORAGE_KEYS.CONFIG, message.payload).then(() =>
        sendResponse({ success: true })
      )
      return true

    case "CLEAR_CACHE":
      void removeStorage(STORAGE_KEYS.CACHE).then(() =>
        sendResponse({ success: true })
      )
      return true

    case "GET_STATISTICS":
      void getStorage(STORAGE_KEYS.STATISTICS).then((stats) =>
        sendResponse(stats || {})
      )
      return true

    default:
      return false
  }
})
