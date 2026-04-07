import { describe, it, expect, beforeEach, vi } from 'vitest'
import pluginManager from '../src/plugins/pluginManager.js'
import wordCounterPlugin from '../src/plugins/examples/wordCounter.js'

describe('pluginManager.js', () => {
  beforeEach(() => {
    pluginManager.clear()
  })

  describe('register', () => {
    it('should register a plugin', () => {
      const result = pluginManager.register(wordCounterPlugin)
      expect(result).toBe(true)
      expect(pluginManager.get('wordCounter')).toBeDefined()
    })

    it('should not register duplicate plugin', () => {
      pluginManager.register(wordCounterPlugin)
      const result = pluginManager.register(wordCounterPlugin)
      expect(result).toBe(false)
    })

    it('should not register invalid plugin', () => {
      const result = pluginManager.register({})
      expect(result).toBe(false)
    })
  })

  describe('get and getAll', () => {
    it('should get registered plugin', () => {
      pluginManager.register(wordCounterPlugin)
      const plugin = pluginManager.get('wordCounter')
      expect(plugin.name).toBe('wordCounter')
    })

    it('should return all registered plugins', () => {
      pluginManager.register(wordCounterPlugin)
      const plugins = pluginManager.getAll()
      expect(plugins.length).toBe(1)
    })
  })

  describe('unregister', () => {
    it('should unregister a plugin', () => {
      pluginManager.register(wordCounterPlugin)
      const result = pluginManager.unregister('wordCounter')
      expect(result).toBe(true)
      expect(pluginManager.get('wordCounter')).toBeUndefined()
    })
  })

  describe('triggerHook', () => {
    it('should trigger plugin hooks', () => {
      const mockPlugin = {
        name: 'testPlugin',
        version: '1.0.0',
        description: 'Test',
        hooks: {
          onInit: vi.fn()
        }
      }
      
      pluginManager.register(mockPlugin)
      pluginManager.setContext({})
      pluginManager.init()
      
      expect(mockPlugin.hooks.onInit).toHaveBeenCalled()
    })
  })

  describe('callApi', () => {
    it('should call plugin API method', () => {
      pluginManager.register(wordCounterPlugin)
      pluginManager.setContext({})
      pluginManager.init()
      
      const result = pluginManager.callApi('wordCounter', 'getStats')
      expect(result).toEqual({
        words: 0,
        characters: 0
      })
    })
  })
})
