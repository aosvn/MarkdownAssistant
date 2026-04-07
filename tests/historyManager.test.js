import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getFileHistory,
  saveFileHistory,
  addToHistory,
  removeFromHistory,
  clearAllHistory
} from '../src/modules/historyManager.js'
import { HISTORY_KEY, MAX_HISTORY } from '../src/utils/constants.js'

describe('historyManager.js', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getFileHistory', () => {
    it('should return empty array when no history exists', () => {
      expect(getFileHistory()).toEqual([])
    })

    it('should return parsed history from localStorage', () => {
      const testHistory = [{ path: '/test.md', name: 'test.md', time: Date.now() }]
      localStorage.setItem(HISTORY_KEY, JSON.stringify(testHistory))
      expect(getFileHistory()).toEqual(testHistory)
    })

    it('should return empty array on parse error', () => {
      localStorage.setItem(HISTORY_KEY, 'invalid json')
      expect(getFileHistory()).toEqual([])
    })
  })

  describe('saveFileHistory', () => {
    it('should save history to localStorage', () => {
      const testHistory = [{ path: '/test.md', name: 'test.md', time: Date.now() }]
      saveFileHistory(testHistory)
      expect(JSON.parse(localStorage.getItem(HISTORY_KEY))).toEqual(testHistory)
    })
  })

  describe('addToHistory', () => {
    it('should add new file to history', () => {
      addToHistory('/test.md')
      const history = getFileHistory()
      expect(history.length).toBe(1)
      expect(history[0].path).toBe('/test.md')
      expect(history[0].name).toBe('test.md')
    })

    it('should move existing file to top of history', () => {
      const now = Date.now()
      const older = now - 100000
      saveFileHistory([
        { path: '/file1.md', name: 'file1.md', time: older },
        { path: '/file2.md', name: 'file2.md', time: older }
      ])
      
      addToHistory('/file2.md')
      const history = getFileHistory()
      expect(history[0].path).toBe('/file2.md')
    })

    it('should not exceed MAX_HISTORY limit', () => {
      for (let i = 0; i < MAX_HISTORY + 10; i++) {
        addToHistory(`/file${i}.md`)
      }
      expect(getFileHistory().length).toBeLessThanOrEqual(MAX_HISTORY)
    })

    it('should do nothing for empty filePath', () => {
      addToHistory('')
      expect(getFileHistory()).toEqual([])
    })
  })

  describe('removeFromHistory', () => {
    it('should remove file from history', () => {
      saveFileHistory([
        { path: '/file1.md', name: 'file1.md', time: Date.now() },
        { path: '/file2.md', name: 'file2.md', time: Date.now() }
      ])
      
      removeFromHistory('/file1.md')
      const history = getFileHistory()
      expect(history.length).toBe(1)
      expect(history[0].path).toBe('/file2.md')
    })
  })

  describe('clearAllHistory', () => {
    it('should clear all history', () => {
      saveFileHistory([
        { path: '/file1.md', name: 'file1.md', time: Date.now() }
      ])
      
      clearAllHistory()
      expect(getFileHistory()).toEqual([])
    })
  })
})
