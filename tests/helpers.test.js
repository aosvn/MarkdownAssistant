import { describe, it, expect } from 'vitest'
import { formatTime, getFileNameFromPath } from '../src/utils/helpers.js'

describe('helpers.js', () => {
  describe('getFileNameFromPath', () => {
    it('should extract filename from Windows path', () => {
      expect(getFileNameFromPath('C:\\Documents\\test.md')).toBe('test.md')
    })

    it('should extract filename from Unix path', () => {
      expect(getFileNameFromPath('/home/user/test.md')).toBe('test.md')
    })

    it('should return empty string for empty path', () => {
      expect(getFileNameFromPath('')).toBe('')
    })

    it('should return empty string for null', () => {
      expect(getFileNameFromPath(null)).toBe('')
    })

    it('should return the same string if no path separators', () => {
      expect(getFileNameFromPath('test.md')).toBe('test.md')
    })
  })

  describe('formatTime', () => {
    it('should return "刚刚" for timestamps less than 1 minute ago', () => {
      const now = Date.now()
      expect(formatTime(now)).toBe('刚刚')
      expect(formatTime(now - 30000)).toBe('刚刚')
    })

    it('should return minutes ago for timestamps between 1 minute and 1 hour ago', () => {
      const now = Date.now()
      expect(formatTime(now - 120000)).toContain('2 分钟前')
    })

    it('should return hours ago for timestamps between 1 hour and 1 day ago', () => {
      const now = Date.now()
      expect(formatTime(now - 7200000)).toContain('2 小时前')
    })

    it('should return days ago for timestamps between 1 day and 1 week ago', () => {
      const now = Date.now()
      expect(formatTime(now - 172800000)).toContain('2 天前')
    })
  })
})
