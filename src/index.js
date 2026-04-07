import 'vditor/dist/index.css'
import { message, confirm } from '@tauri-apps/api/dialog'
import { appWindow } from '@tauri-apps/api/window'
import { initErrorHandling } from './utils/errorHandler.js'
import { initTheme, setTheme } from './modules/themeManager.js'
import { 
  initVditor, 
  switchMode, 
  getVditor,
  updateModeButtons 
} from './modules/editor.js'
import {
  getCurrentFilePath,
  setCurrentFilePath,
  getIsModified,
  setModified,
  updateCurrentFileName,
  setCallbacks,
  setVditorInstance,
  newFile,
  openFile,
  saveFile,
  saveAsFile,
  closeFile,
  openHistoryFile
} from './modules/fileManager.js'
import {
  getFileHistory,
  removeFromHistory,
  clearAllHistory,
  renderHistoryList
} from './modules/historyManager.js'
import { exportToPdf, exportViaBrowser } from './modules/pdfExporter.js'

function updateUIText() {
  document.getElementById('newFile').title = '新建文件'
  document.getElementById('openFile').title = '打开文件'
  document.getElementById('historyBtn').title = '历史文件'
  document.getElementById('saveFile').title = '保存文件'
  document.getElementById('saveAsFile').title = '另存为'
  document.getElementById('closeFile').title = '关闭'
  document.getElementById('exportPdf').title = '导出为PDF'
  
  document.getElementById('themeLight').title = '浅色主题'
  document.getElementById('themeDark').title = '深色主题'
  document.getElementById('themeGray').title = '灰色主题'
  
  document.querySelector('#themeLight .theme-label').textContent = '浅色'
  document.querySelector('#themeDark .theme-label').textContent = '深色'
  document.querySelector('#themeGray .theme-label').textContent = '灰色'
  
  document.getElementById('modeWysiwyg').title = '所见即所得模式'
  document.getElementById('modeIR').title = '即时渲染模式'
  document.getElementById('modeSV').title = '分屏预览模式'
  
  document.querySelector('#historyModal .modal-header h3').textContent = '历史文件'
  document.getElementById('clearAllHistory').textContent = '清除全部历史'
  
  document.querySelector('#pdfModal .modal-header h3').textContent = '导出为PDF'
  document.querySelector('#pdfModal label[for="pdfPageSize"]').textContent = '页面大小'
  document.querySelector('#pdfModal label[for="pdfOrientation"]').textContent = '页面方向'
  document.querySelector('#pdfModal label[for="pdfMargin"]').textContent = '边距'
  document.querySelector('#pdfPageSize option[value="a4"]').textContent = 'A4'
  document.querySelector('#pdfPageSize option[value="letter"]').textContent = 'Letter'
  document.querySelector('#pdfPageSize option[value="legal"]').textContent = 'Legal'
  document.querySelector('#pdfOrientation option[value="portrait"]').textContent = '纵向'
  document.querySelector('#pdfOrientation option[value="landscape"]').textContent = '横向'
  document.querySelector('#pdfMargin option[value="default"]').textContent = '默认'
  document.querySelector('#pdfMargin option[value="none"]').textContent = '无'
  document.querySelector('#pdfMargin option[value="minimum"]').textContent = '最小'
  document.getElementById('cancelPdf').textContent = '取消'
  document.getElementById('confirmPdf').textContent = '导出'
  
  updateCurrentFileNameUI(getCurrentFilePath())
}

function updateCurrentFileNameUI(name) {
  const fileName = name || '未命名文件'
  document.getElementById('currentFile').textContent = fileName
}

function setModifiedUI(modified) {
  const indicator = document.getElementById('modifiedIndicator')
  if (modified) {
    indicator.classList.remove('hidden')
  } else {
    indicator.classList.add('hidden')
  }
}

function openHistoryModal() {
  renderHistoryList(document.getElementById('historyList'))
  document.getElementById('historyModal').classList.remove('hidden')
  document.getElementById('overlay').classList.remove('hidden')
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.add('hidden')
  document.getElementById('overlay').classList.add('hidden')
}

function openPdfModal() {
  document.getElementById('pdfModal').classList.remove('hidden')
  document.getElementById('overlay').classList.remove('hidden')
}

function closePdfModal() {
  document.getElementById('pdfModal').classList.add('hidden')
  document.getElementById('overlay').classList.add('hidden')
}

function setupEventListeners() {
  document.getElementById('newFile').addEventListener('click', async () => {
    const success = await newFile()
    if (success) {
      const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
      initVditor(currentMode, '')
    }
  })

  document.getElementById('openFile').addEventListener('click', async () => {
    const content = await openFile()
    if (content !== null) {
      const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
      initVditor(currentMode, content)
    }
  })

  document.getElementById('historyBtn').addEventListener('click', openHistoryModal)

  document.getElementById('saveFile').addEventListener('click', async () => {
    const vditor = getVditor()
    if (vditor) {
      await saveFile(vditor.getValue())
    }
  })

  document.getElementById('saveAsFile').addEventListener('click', async () => {
    const vditor = getVditor()
    if (vditor) {
      await saveAsFile(vditor.getValue())
    }
  })

  document.getElementById('closeFile').addEventListener('click', async () => {
    const success = await closeFile()
    if (success) {
      const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
      initVditor(currentMode, '')
    }
  })

  document.getElementById('exportPdf').addEventListener('click', openPdfModal)

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode)
    })
  })

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme)
    })
  })

  document.getElementById('closeHistoryModal').addEventListener('click', closeHistoryModal)

  document.getElementById('clearAllHistory').addEventListener('click', async () => {
    const confirmed = await confirm('确定要清除全部历史记录吗？', {
      title: '确认',
      type: 'warning',
    })
    if (confirmed) {
      clearAllHistory()
      renderHistoryList(document.getElementById('historyList'))
      message('已清除全部历史记录', { type: 'success' })
    }
  })

  document.getElementById('closePdfModal').addEventListener('click', closePdfModal)
  document.getElementById('cancelPdf').addEventListener('click', closePdfModal)
  document.getElementById('confirmPdf').addEventListener('click', async () => {
    const vditor = getVditor()
    if (vditor) {
      const success = await exportToPdf(vditor)
      if (success) {
        closePdfModal()
      }
    }
  })

  document.getElementById('overlay').addEventListener('click', () => {
    closeHistoryModal()
    closePdfModal()
  })

  document.getElementById('historyList').addEventListener('click', async (e) => {
    const historyItem = e.target.closest('.history-item')
    if (historyItem) {
      if (e.target.classList.contains('history-item-remove')) {
        e.stopPropagation()
        const filePath = e.target.dataset.path
        removeFromHistory(filePath)
        renderHistoryList(document.getElementById('historyList'))
      } else {
        const filePath = historyItem.dataset.path
        const content = await openHistoryFile(filePath)
        if (content !== null) {
          closeHistoryModal()
          const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
          initVditor(currentMode, content)
        }
      }
    }
  })

  document.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      const vditor = getVditor()
      if (vditor) {
        if (e.shiftKey) {
          await saveAsFile(vditor.getValue())
        } else {
          await saveFile(vditor.getValue())
        }
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      const success = await newFile()
      if (success) {
        const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
        initVditor(currentMode, '')
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      const content = await openFile()
      if (content !== null) {
        const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
        initVditor(currentMode, content)
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault()
      const success = await closeFile()
      if (success) {
        const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv'
        initVditor(currentMode, '')
      }
    }
    if (e.key === 'Escape') {
      closeHistoryModal()
      closePdfModal()
    }
  })

  appWindow.onCloseRequested((event) => {
    if (getIsModified()) {
      event.preventDefault()
      confirm('文件尚未保存，确定要退出吗？', {
        title: '确认退出',
        type: 'warning'
      }).then((confirmed) => {
        if (confirmed) {
          appWindow.close()
        }
      })
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[index] DOMContentLoaded')
  initErrorHandling()
  setCallbacks(updateCurrentFileNameUI, setModifiedUI)
  initTheme()
  updateUIText()
  initVditor('sv', '')
  setupEventListeners()
})
