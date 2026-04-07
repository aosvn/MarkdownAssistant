import { HISTORY_KEY, MAX_HISTORY } from '../utils/constants.js'
import { formatTime, getFileNameFromPath } from '../utils/helpers.js'

/**
 * 获取文件历史记录
 * @returns {import('../utils/constants.js').FileHistoryItem[]} 历史记录数组
 */
export function getFileHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (e) {
    console.error('Error reading file history:', e)
    return []
  }
}

/**
 * 保存文件历史记录
 * @param {import('../utils/constants.js').FileHistoryItem[]} history - 历史记录数组
 */
export function saveFileHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Error saving file history:', e)
  }
}

/**
 * 添加文件到历史记录
 * @param {string} filePath - 文件路径
 */
export function addToHistory(filePath) {
  if (!filePath) return
  
  let history = getFileHistory()
  const now = Date.now()
  const fileName = getFileNameFromPath(filePath)
  
  history = history.filter(item => item.path !== filePath)
  history.unshift({
    path: filePath,
    name: fileName,
    time: now
  })
  
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY)
  }
  
  saveFileHistory(history)
}

/**
 * 从历史记录中移除文件
 * @param {string} filePath - 文件路径
 */
export function removeFromHistory(filePath) {
  let history = getFileHistory()
  history = history.filter(item => item.path !== filePath)
  saveFileHistory(history)
}

/**
 * 清除所有历史记录
 */
export function clearAllHistory() {
  saveFileHistory([])
}

/**
 * 渲染历史记录列表
 * @param {HTMLElement} container - 容器元素
 */
export function renderHistoryList(container) {
  const history = getFileHistory()
  
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-history">暂无历史文件</div>'
    return
  }
  
  container.innerHTML = history.map(item => `
    <div class="history-item" data-path="${item.path}">
      <div class="history-item-info">
        <div class="history-item-name">${item.name}</div>
        <div class="history-item-path">${item.path}</div>
      </div>
      <div class="history-item-time">${formatTime(item.time)}</div>
      <button class="history-item-remove" data-path="${item.path}" title="删除">×</button>
    </div>
  `).join('')
}
