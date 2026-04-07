import { THEME_KEY, DEFAULT_THEME } from '../utils/constants.js'

let vditorInstance = null

export function setVditorInstance(vditor) {
  vditorInstance = vditor
}

export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT_THEME
}

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

export function initTheme() {
  const savedTheme = getCurrentTheme()
  setTheme(savedTheme)
}
