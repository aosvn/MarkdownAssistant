import { THEME_KEY, DEFAULT_THEME } from '../utils/constants.js'

let vditorInstance = null

/**
 * 设置Vditor实例
 * @param {Object} vditor - Vditor编辑器实例
 */
export function setVditorInstance(vditor) {
  vditorInstance = vditor
}

/**
 * 获取当前主题
 * @returns {string} 当前主题名称
 */
export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME
}

/**
 * 设置主题
 * @param {string} theme - 主题名称
 */
export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active')
      if (btn.dataset.theme === theme) {
        btn.classList.add('active')
      }
    })
    
    updateVditorTheme(theme)
    
    console.log('Theme switched to:', theme)
  } catch (error) {
    console.error('Failed to set theme:', error)
  }
}

/**
 * 更新Vditor编辑器主题
 * @param {string} theme - 主题名称
 */
export function updateVditorTheme(theme) {
  if (!vditorInstance) return
  
  try {
    const vditorTheme = theme === 'dark' ? 'dark' : 'light'
    vditorInstance.setTheme(vditorTheme)
    vditorInstance.setPreviewTheme(vditorTheme)
  } catch (error) {
    console.warn('Failed to update Vditor theme:', error)
  }
}

/**
 * 初始化主题
 */
export function initTheme() {
  const savedTheme = getCurrentTheme()
  setTheme(savedTheme)
}
