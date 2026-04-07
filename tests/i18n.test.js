import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getLocale, setLocale, t, getAvailableLocales, initI18n } from '../src/i18n/index.js'

const LOCALE_KEY = 'markdown_assistant_locale'

describe('i18n.js', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
  })

  describe('getLocale', () => {
    it('should return default locale when no locale saved', () => {
      expect(getLocale()).toBe('zh-CN')
    })

    it('should return saved locale from localStorage', () => {
      localStorage.setItem(LOCALE_KEY, 'en-US')
      expect(getLocale()).toBe('en-US')
    })
  })

  describe('setLocale', () => {
    it('should set locale and save to localStorage', () => {
      setLocale('en-US')
      expect(localStorage.getItem(LOCALE_KEY)).toBe('en-US')
    })

    it('should set lang attribute on document', () => {
      setLocale('en-US')
      expect(document.documentElement.getAttribute('lang')).toBe('en-US')
    })

    it('should use default locale for invalid locale', () => {
      setLocale('invalid')
      expect(getLocale()).toBe('zh-CN')
    })
  })

  describe('t', () => {
    beforeEach(() => {
      setLocale('zh-CN')
    })

    it('should translate simple key', () => {
      expect(t('app.title')).toBe('Markdown Assistant')
    })

    it('should translate nested key', () => {
      expect(t('toolbar.newFile')).toBe('新建文件')
    })

    it('should return key when not found', () => {
      expect(t('invalid.key')).toBe('invalid.key')
    })
  })

  describe('getAvailableLocales', () => {
    it('should return list of available locales', () => {
      const locales = getAvailableLocales()
      expect(locales).toEqual([
        { code: 'zh-CN', name: '简体中文' },
        { code: 'en-US', name: 'English' }
      ])
    })
  })

  describe('initI18n', () => {
    it('should initialize with saved locale', () => {
      localStorage.setItem(LOCALE_KEY, 'en-US')
      initI18n()
      expect(document.documentElement.getAttribute('lang')).toBe('en-US')
    })
  })
})
