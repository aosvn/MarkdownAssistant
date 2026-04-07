/**
 * 格式化时间戳为相对时间字符串
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

/**
 * 从文件路径中提取文件名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件名
 */
export function getFileNameFromPath(filePath) {
  if (!filePath) return ''
  const pathParts = filePath.split(/[/\\]/)
  return pathParts[pathParts.length - 1]
}
