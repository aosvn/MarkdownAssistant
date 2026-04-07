import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getCurrentTheme,
  setTheme,
  initTheme
} from '../src/modules/themeManager.js'
import { THEME_KEY, DEFAULT_THEME } from '../src/utils/constants.js'

describe('themeManager.js', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  describe('getCurrentTheme', () => {
    it('should return DEFAULT_THEME when no theme is saved', () => {
      expect(getCurrentTheme()).toBe(DEFAULT_THEME)
    })

    it('should return saved theme from localStorage', () => {
      localStorage.setItem(THEME_KEY, 'dark')
      expect(getCurrentTheme()).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('should save theme to localStorage', () => {
      setTheme('dark')
      expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    })

    it('should set data-theme attribute on document', () => {
      setTheme('gray')
      expect(document.documentElement.getAttribute('data-theme')).toBe('gray')
    })
  })

  describe('initTheme', () => {
    it('should initialize with saved theme', () => {
      localStorage.setItem(THEME_KEY, 'dark')
      initTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('should initialize with default theme when no theme is saved', () => {
      initTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME)
    })
  })
})
