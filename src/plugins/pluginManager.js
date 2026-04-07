/**
 * 插件系统核心模块
 * 提供插件加载、生命周期管理和API访问功能
 */

/**
 * @typedef {Object} Plugin
 * @property {string} name - 插件名称
 * @property {string} version - 插件版本
 * @property {string} description - 插件描述
 * @property {Object} [hooks] - 插件钩子函数
 * @property {Function} [hooks.onInit] - 初始化钩子
 * @property {Function} [hooks.onBeforeSave] - 保存前钩子
 * @property {Function} [hooks.onAfterSave] - 保存后钩子
 * @property {Function} [hooks.onBeforeLoad] - 加载前钩子
 * @property {Function} [hooks.onAfterLoad] - 加载后钩子
 * @property {Function} [hooks.onEditorChange] - 编辑器变化钩子
 * @property {Object} [api] - 插件暴露的API
 */

/**
 * @typedef {Object} PluginContext
 * @property {Object} editor - 编辑器API
 * @property {Object} fileManager - 文件管理器API
 * @property {Object} themeManager - 主题管理器API
 * @property {Object} i18n - 国际化API
 */

class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.context = null
    this.isInitialized = false
  }

  /**
   * 设置插件上下文
   * @param {PluginContext} context - 插件上下文
   */
  setContext(context) {
    this.context = context
  }

  /**
   * 注册插件
   * @param {Plugin} plugin - 插件对象
   * @returns {boolean} 是否注册成功
   */
  register(plugin) {
    if (!plugin || !plugin.name) {
      console.error('[PluginManager] Invalid plugin: missing name')
      return false
    }

    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin '${plugin.name}' already registered`)
      return false
    }

    this.plugins.set(plugin.name, plugin)
    console.log(`[PluginManager] Plugin '${plugin.name}' registered`)
    
    if (this.isInitialized) {
      this.initPlugin(plugin)
    }
    
    return true
  }

  /**
   * 初始化单个插件
   * @param {Plugin} plugin - 插件对象
   * @private
   */
  initPlugin(plugin) {
    if (plugin.hooks && plugin.hooks.onInit) {
      try {
        plugin.hooks.onInit(this.context)
        console.log(`[PluginManager] Plugin '${plugin.name}' initialized`)
      } catch (error) {
        console.error(`[PluginManager] Failed to initialize plugin '${plugin.name}':`, error)
      }
    }
  }

  /**
   * 初始化所有已注册的插件
   */
  init() {
    if (this.isInitialized) {
      console.warn('[PluginManager] Already initialized')
      return
    }

    this.isInitialized = true
    
    for (const [name, plugin] of this.plugins) {
      this.initPlugin(plugin)
    }
    
    console.log('[PluginManager] All plugins initialized')
  }

  /**
   * 获取插件
   * @param {string} name - 插件名称
   * @returns {Plugin|undefined} 插件对象
   */
  get(name) {
    return this.plugins.get(name)
  }

  /**
   * 获取所有已注册的插件
   * @returns {Plugin[]} 插件数组
   */
  getAll() {
    return Array.from(this.plugins.values())
  }

  /**
   * 卸载插件
   * @param {string} name - 插件名称
   * @returns {boolean} 是否卸载成功
   */
  unregister(name) {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      console.warn(`[PluginManager] Plugin '${name}' not found`)
      return false
    }

    this.plugins.delete(name)
    console.log(`[PluginManager] Plugin '${name}' unregistered`)
    return true
  }

  /**
   * 触发插件钩子
   * @param {string} hookName - 钩子名称
   * @param {...any} args - 钩子参数
   */
  triggerHook(hookName, ...args) {
    for (const [name, plugin] of this.plugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        try {
          plugin.hooks[hookName](...args)
        } catch (error) {
          console.error(`[PluginManager] Error in plugin '${name}' hook '${hookName}':`, error)
        }
      }
    }
  }

  /**
   * 调用插件API
   * @param {string} pluginName - 插件名称
   * @param {string} methodName - 方法名称
   * @param {...any} args - 方法参数
   * @returns {any} 方法返回值
   */
  callApi(pluginName, methodName, ...args) {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.error(`[PluginManager] Plugin '${pluginName}' not found`)
      return undefined
    }

    if (!plugin.api || !plugin.api[methodName]) {
      console.error(`[PluginManager] Method '${methodName}' not found in plugin '${pluginName}'`)
      return undefined
    }

    try {
      return plugin.api[methodName](...args)
    } catch (error) {
      console.error(`[PluginManager] Error calling plugin '${pluginName}' method '${methodName}':`, error)
      return undefined
    }
  }

  /**
   * 清除所有插件
   */
  clear() {
    this.plugins.clear()
    this.isInitialized = false
    console.log('[PluginManager] All plugins cleared')
  }
}

export const pluginManager = new PluginManager()

export default pluginManager
