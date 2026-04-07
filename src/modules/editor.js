import Vditor from 'vditor'
import { getCurrentTheme, updateVditorTheme, setVditorInstance as setThemeVditorInstance } from './themeManager.js'
import { setVditorInstance as setFileManagerVditorInstance } from './fileManager.js'

let vditor = null
let currentMode = 'sv'

export function getVditor() {
  return vditor
}

export function getCurrentMode() {
  return currentMode
}

export function setCurrentMode(mode) {
  currentMode = mode
}

export function initVditor(mode = 'sv', initialContent = '') {
  const container = document.getElementById('vditor')
  const currentTheme = getCurrentTheme()
  const vditorTheme = currentTheme === 'dark' ? 'dark' : 'light'
  
  let currentContent = initialContent
  if (vditor) {
    try {
      if (initialContent === '') {
        currentContent = ''
      } else {
        currentContent = vditor.getValue()
      }
    } catch (e) {
      console.warn('Error getting content:', e)
    }
    try {
      vditor.destroy()
    } catch (e) {
      console.warn('Error destroying Vditor:', e)
    }
    vditor = null
  }
  
  container.innerHTML = ''
  
  vditor = new Vditor('vditor', {
    height: '100%',
    mode: mode,
    theme: vditorTheme,
    icon: 'material',
    cache: {
      enable: false,
    },
    counter: {
      enable: true,
      type: 'lines',
    },
    preview: {
      theme: {
        current: vditorTheme,
        path: './node_modules/vditor/dist/css/content-theme',
      },
      hljs: {
        enable: true,
        style: 'github',
        lineNumber: true,
      },
      math: {
        inlineDigit: true,
        engine: 'KaTeX',
      },
      mermaid: {
        enable: true,
      },
      markdown: {
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
        fixTermTypo: true,
        mermaid: true,
      },
    },
    hint: {
      emojiPath: './node_modules/vditor/dist/images/emoji',
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'line',
      'quote',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'code',
      'inline-code',
      'link',
      'image',
      'table',
      'mermaid',
      '|',
      'edit-mode',
      'both',
      'preview',
      '|',
      'fullscreen',
      'read-mode',
      'help',
    ],
    after: () => {
      console.log('Vditor initialized with mode:', mode)
      updateModeButtons(mode)
      vditor.setValue(currentContent)
    },
    input: () => {
    },
  })

  setThemeVditorInstance(vditor)
  setFileManagerVditorInstance(vditor)
  currentMode = mode
}

export function updateModeButtons(mode) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  const activeBtn = document.querySelector(`[data-mode="${mode}"]`)
  if (activeBtn) {
    activeBtn.classList.add('active')
  }
}

export async function switchMode(mode) {
  try {
    console.log('Switching to mode:', mode)
    let currentContent = ''
    if (vditor) {
      try {
        currentContent = vditor.getValue()
      } catch (e) {
        console.warn('Error getting content before mode switch:', e)
      }
    }
    initVditor(mode, currentContent)
    console.log('Mode switched successfully')
  } catch (error) {
    console.error('Failed to switch mode:', error)
  }
}
