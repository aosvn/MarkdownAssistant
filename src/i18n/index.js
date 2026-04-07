/**
 * 国际化（i18n）模块
 * 提供多语言支持功能
 */

import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

const LOCALE_KEY = 'markdown_assistant_locale'
const DEFAULT_LOCALE = 'zh-CN'

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS
}

let currentLocale = DEFAULT_LOCALE
let currentMessages = locales[DEFAULT_LOCALE]

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
export function getLocale() {
  const saved = localStorage.getItem(LOCALE_KEY)
  return saved || DEFAULT_LOCALE
}

/**
 * 设置语言
 * @param {string} locale - 语言代码
 */
export function setLocale(locale) {
  if (!locales[locale]) {
    console.warn(`[i18n] Locale '${locale}' not found, using default`)
    locale = DEFAULT_LOCALE
  }
  
  currentLocale = locale
  currentMessages = locales[locale]
  localStorage.setItem(LOCALE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
  
  console.log(`[i18n] Locale changed to: ${locale}`)
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键，支持点号分隔的嵌套键（如 'toolbar.newFile'）
 * @param {Object} [params] - 替换参数
 * @returns {string} 翻译后的文本
 */
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = currentMessages
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`[i18n] Key '${key}' not found`)
      return key
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`[i18n] Key '${key}' is not a string`)
    return key
  }
  
  return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
    return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`
  })
}

/**
 * 获取可用语言列表
 * @returns {Array<{code: string, name: string}>} 语言列表
 */
export function getAvailableLocales() {
  return [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' }
  ]
}

/**
 * 初始化i18n
 */
export function initI18n() {
  const locale = getLocale()
  setLocale(locale)
}

export default {
  getLocale,
  setLocale,
  t,
  getAvailableLocales,
  initI18n
}
