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

function updateCurrentFileNameUI(name) {
  document.getElementById('currentFile').textContent = name || '未命名文件'
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
  setCallbacks(updateCurrentFileNameUI, setModifiedUI)
  initTheme()
  initVditor('sv', '')
  setupEventListeners()
})
