import { message } from '@tauri-apps/api/dialog'

export function getCleanPreviewHTML() {
  let previewHTML = ''
  const previewContent = document.querySelector('.vditor-preview__content')
  if (previewContent) {
    previewHTML = previewContent.innerHTML
  } else {
    const preview = document.querySelector('.vditor-preview')
    if (preview) {
      const innerContent = preview.querySelector('.vditor-reset, .vditor-preview__content')
      if (innerContent) {
        previewHTML = innerContent.innerHTML
      } else {
        previewHTML = preview.innerHTML
      }
    }
  }
  
  if (!previewHTML) {
    return null
  }
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = previewHTML
  
  tempDiv.querySelectorAll('.vditor-code, .vditor-ir__preview, .vditor-reset').forEach(el => {
    el.classList.remove('vditor-code', 'vditor-ir__preview', 'vditor-reset')
  })
  
  tempDiv.querySelectorAll('[class*="vditor-"]').forEach(el => {
    const classesToRemove = Array.from(el.classList).filter(c => c.startsWith('vditor-'))
    el.classList.remove(...classesToRemove)
  })
  
  tempDiv.querySelectorAll('pre').forEach(pre => {
    const codeElement = pre.querySelector('code')
    if (codeElement) {
      const codeContent = codeElement.textContent
      const languageClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'))
      pre.innerHTML = ''
      const newCode = document.createElement('code')
      if (languageClass) {
        newCode.className = languageClass
      }
      newCode.textContent = codeContent
      pre.appendChild(newCode)
    }
  })
  
  return tempDiv.innerHTML
}

export function getPdfStyles() {
  return `
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 20px;
      max-width: 100%;
      line-height: 1.6;
      color: #24292e;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      color: #24292e;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    p { margin: 1em 0; }
    code {
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      display: block;
      white-space: pre;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 16px;
      margin-left: 0;
      color: #6a737d;
      page-break-inside: avoid;
    }
    ul, ol {
      padding-left: 2em;
      margin: 1em 0;
    }
    li { margin: 0.5em 0; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
      text-align: left;
    }
    th { background-color: #f6f8fa; }
    img { 
      max-width: 100%; 
      height: auto; 
      page-break-inside: avoid;
    }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr {
      border: none;
      border-top: 1px solid #dfe2e5;
      margin: 2em 0;
    }
    .page-break {
      page-break-before: always;
    }
    @media print {
      @page {
        margin: 15mm;
      }
      body {
        padding: 0;
      }
    }
  `
}

export function getMarginValue(margin) {
  const margins = {
    default: [15, 15, 15, 15],
    none: [0, 0, 0, 0],
    minimum: [5, 5, 5, 5]
  }
  return margins[margin] || margins.default
}

export async function exportViaBrowser(pageSize, orientation, margin) {
  const previewHTML = getCleanPreviewHTML()
  if (!previewHTML) {
    message('无法获取预览内容，请尝试切换到分屏或预览模式', { type: 'error' })
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    message('无法打开打印窗口，请允许弹出窗口', { type: 'error' })
    return
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Markdown Document</title>
      <style>
        ${getPdfStyles()}
        @page {
          size: ${pageSize} ${orientation};
          margin: ${margin === 'none' ? '0' : margin === 'minimum' ? '5mm' : '15mm'};
        }
      </style>
    </head>
    <body>
      ${previewHTML}
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()

  setTimeout(function() {
    printWindow.focus()
    printWindow.print()
  }, 300)

  message('打印窗口已打开，请选择"保存为PDF"', { type: 'info' })
}

export async function exportToPdf(vditorInstance) {
  try {
    const content = vditorInstance.getValue()
    if (!content.trim()) {
      message('文档内容为空，无法导出', { type: 'warning' })
      return false
    }
    
    const pageSize = document.getElementById('pdfPageSize').value
    const orientation = document.getElementById('pdfOrientation').value
    const margin = document.getElementById('pdfMargin').value
    
    await exportViaBrowser(pageSize, orientation, margin)
    return true
  } catch (error) {
    console.error('Error exporting PDF:', error)
    message('导出PDF失败: ' + error.message, { type: 'error' })
    return false
  }
}
