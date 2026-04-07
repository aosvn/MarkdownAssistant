import Vditor from 'vditor'
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
import { initI18n, setLocale, t, getAvailableLocales } from './i18n/index.js'

function updateUIText() {
  document.getElementById('newFile').title = t('toolbar.newFile')
  document.getElementById('openFile').title = t('toolbar.openFile')
  document.getElementById('historyBtn').title = t('toolbar.history')
  document.getElementById('saveFile').title = t('toolbar.save')
  document.getElementById('saveAsFile').title = t('toolbar.saveAs')
  document.getElementById('closeFile').title = t('toolbar.close')
  document.getElementById('exportPdf').title = t('toolbar.exportPdf')
  
  document.getElementById('themeLight').title = t('theme.light')
  document.getElementById('themeDark').title = t('theme.dark')
  document.getElementById('themeGray').title = t('theme.gray')
  
  document.querySelector('#themeLight .theme-label').textContent = t('theme.light')
  document.querySelector('#themeDark .theme-label').textContent = t('theme.dark')
  document.querySelector('#themeGray .theme-label').textContent = t('theme.gray')
  
  document.getElementById('modeWysiwyg').title = t('editor.mode.wysiwyg')
  document.getElementById('modeIR').title = t('editor.mode.ir')
  document.getElementById('modeSV').title = t('editor.mode.sv')
  
  document.querySelector('#historyModal .modal-header h3').textContent = t('modal.history.title')
  document.getElementById('clearAllHistory').textContent = t('modal.history.clearAll')
  
  document.querySelector('#pdfModal .modal-header h3').textContent = t('modal.pdf.title')
  document.querySelector('#pdfModal label[for="pdfPageSize"]').textContent = t('modal.pdf.pageSize')
  document.querySelector('#pdfModal label[for="pdfOrientation"]').textContent = t('modal.pdf.orientation')
  document.querySelector('#pdfModal label[for="pdfMargin"]').textContent = t('modal.pdf.margin')
  document.querySelector('#pdfPageSize option[value="a4"]').textContent = 'A4'
  document.querySelector('#pdfPageSize option[value="letter"]').textContent = 'Letter'
  document.querySelector('#pdfPageSize option[value="legal"]').textContent = 'Legal'
  document.querySelector('#pdfOrientation option[value="portrait"]').textContent = t('modal.pdf.portrait')
  document.querySelector('#pdfOrientation option[value="landscape"]').textContent = t('modal.pdf.landscape')
  document.querySelector('#pdfMargin option[value="default"]').textContent = t('modal.pdf.default')
  document.querySelector('#pdfMargin option[value="none"]').textContent = t('modal.pdf.none')
  document.querySelector('#pdfMargin option[value="minimum"]').textContent = t('modal.pdf.minimum')
  document.getElementById('cancelPdf').textContent = t('modal.pdf.cancel')
  document.getElementById('confirmPdf').textContent = t('modal.pdf.confirm')
  
  updateCurrentFileNameUI(getCurrentFilePath())
}

function updateLangButtons() {
  const currentLocale = getLocale()
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.locale === currentLocale) {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })
}

function handleLocaleChange(locale) {
  setLocale(locale)
  updateUIText()
  updateLangButtons()
}

function updateCurrentFileNameUI(name) {
  const fileName = name || t('toolbar.currentFile')
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

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleLocaleChange(btn.dataset.locale)
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

  const vditor = getVditor()
  if (vditor) {
    vditor.options.input = () => {
      setModified(true)
    }
  }

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
  initErrorHandling()
  initI18n()
  setCallbacks(updateCurrentFileNameUI, setModifiedUI)
  initTheme()
  updateUIText()
  updateLangButtons()
  initVditor('sv', '')
  setupEventListeners()
})
