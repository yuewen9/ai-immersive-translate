export const getLocalStorageValue = async <T>(key: string): Promise<T | undefined> => {
  const result = await chrome.storage.local.get(key)
  return result[key] as T | undefined
}

export const setLocalStorageValue = async (key: string, value: unknown) => {
  await chrome.storage.local.set({ [key]: value })
}

export const removeLocalStorageValue = async (key: string) => {
  await chrome.storage.local.remove(key)
}
