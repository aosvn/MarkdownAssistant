import { open, save, confirm, message } from '@tauri-apps/api/dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { getFileNameFromPath } from '../utils/helpers.js'
import { addToHistory } from './historyManager.js'

let currentFilePath = null
let isModified = false
let vditorInstance = null
let updateCurrentFileNameCallback = null
let setModifiedCallback = null

export function setVditorInstance(vditor) {
  vditorInstance = vditor
  if (vditorInstance) {
    console.log('[fileManager] Setting vditor input callback')
    vditorInstance.options.input = () => {
      setModified(true)
    }
  }
}

export function setCallbacks(updateFileName, setModified) {
  updateCurrentFileNameCallback = updateFileName
  setModifiedCallback = setModified
}

export function getCurrentFilePath() {
  return currentFilePath
}

export function setCurrentFilePath(path) {
  currentFilePath = path
}

export function getIsModified() {
  return isModified
}

export function setModified(modified) {
  isModified = modified
  if (setModifiedCallback) {
    setModifiedCallback(modified)
  }
}

export function updateCurrentFileName(name) {
  if (updateCurrentFileNameCallback) {
    updateCurrentFileNameCallback(name || '未命名文件')
  }
}

export async function newFile() {
  if (isModified) {
    const confirmed = await confirm('当前文件未保存，是否继续创建新文件？', {
      title: '确认',
      type: 'warning',
    })
    if (!confirmed) return false
  }
  currentFilePath = null
  updateCurrentFileName('未命名文件')
  setModified(false)
  return true
}

export async function openFile() {
  try {
    console.log('[fileManager] openFile called')
    if (isModified) {
      const confirmed = await confirm('当前文件未保存，是否继续打开新文件？', {
        title: '确认',
        type: 'warning',
      })
      if (!confirmed) {
        console.log('[fileManager] User cancelled open')
        return null
      }
    }
    
    console.log('[fileManager] Opening file dialog')
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Markdown',
          extensions: ['md', 'markdown'],
        },
      ],
    })
    console.log('[fileManager] Selected file:', selected)
    if (selected) {
      console.log('[fileManager] Reading file content')
      const content = await readTextFile(selected)
      console.log('[fileManager] File content length:', content.length)
      console.log('[fileManager] File content preview:', content.substring(0, 100))
      currentFilePath = selected
      updateCurrentFileName(getFileNameFromPath(selected))
      setModified(false)
      addToHistory(selected)
      console.log('[fileManager] Returning content')
      return content
    }
    console.log('[fileManager] No file selected')
    return null
  } catch (error) {
    console.error('[fileManager] Error opening file:', error)
    console.error('[fileManager] Error stack:', error.stack)
    message('打开文件失败: ' + error.message, { type: 'error' })
    return null
  }
}

export async function saveFile(content) {
  if (!currentFilePath) {
    return await saveAsFile(content)
  }
  try {
    await writeTextFile(currentFilePath, content)
    setModified(false)
    addToHistory(currentFilePath)
    message('文件保存成功', { type: 'success' })
    return true
  } catch (error) {
    console.error('Error saving file:', error)
    message('保存文件失败', { type: 'error' })
    return false
  }
}

export async function saveAsFile(content) {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'Markdown',
          extensions: ['md'],
        },
      ],
    })
    if (filePath) {
      await writeTextFile(filePath, content)
      currentFilePath = filePath
      updateCurrentFileName(getFileNameFromPath(filePath))
      setModified(false)
      addToHistory(filePath)
      message('文件保存成功', { type: 'success' })
      return true
    }
    return false
  } catch (error) {
    console.error('Error saving file:', error)
    message('保存文件失败', { type: 'error' })
    return false
  }
}

export async function closeFile() {
  try {
    if (!currentFilePath && !isModified && vditorInstance && vditorInstance.getValue().trim() === '') {
      message('当前没有打开的文件', { type: 'info' })
      return false
    }

    if (isModified) {
      const confirmed = await confirm('当前文件未保存，确定要关闭吗？', {
        title: '确认关闭',
        type: 'warning',
      })
      if (!confirmed) return false
    }

    currentFilePath = null
    updateCurrentFileName('未命名文件')
    setModified(false)
    message('文件已关闭', { type: 'success' })
    return true
  } catch (error) {
    console.error('Error closing file:', error)
    message('关闭文件失败: ' + error.message, { type: 'error' })
    return false
  }
}

export async function openHistoryFile(filePath) {
  try {
    console.log('[fileManager] openHistoryFile called with filePath:', filePath)
    if (isModified) {
      const confirmed = await confirm('当前文件未保存，是否继续打开历史文件？', {
        title: '确认',
        type: 'warning',
      })
      if (!confirmed) {
        console.log('[fileManager] User cancelled open history')
        return null
      }
    }
    
    console.log('[fileManager] Reading history file:', filePath)
    const content = await readTextFile(filePath)
    console.log('[fileManager] History file content length:', content.length)
    console.log('[fileManager] History file content preview:', content.substring(0, 100))
    currentFilePath = filePath
    updateCurrentFileName(getFileNameFromPath(filePath))
    setModified(false)
    addToHistory(filePath)
    console.log('[fileManager] Returning history content')
    return content
  } catch (error) {
    console.error('[fileManager] Error opening history file:', error)
    console.error('[fileManager] Error stack:', error.stack)
    message('打开文件失败: ' + error.message, { type: 'error' })
    return null
  }
}
