import Vditor from 'vditor';
import { open, save, confirm, message } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, writeBinaryFile } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window';
import html2pdf from 'html2pdf.js';

let vditor;
let currentFilePath = null;
let isModified = false;
const HISTORY_KEY = 'markdown_assistant_file_history';
const MAX_HISTORY = 50;

function initVditor(mode = 'sv', initialContent = '') {
  const container = document.getElementById('vditor');
  
  let currentContent = initialContent;
  if (vditor) {
    try {
      currentContent = vditor.getValue();
    } catch (e) {
      console.warn('Error getting content:', e);
    }
    try {
      vditor.destroy();
    } catch (e) {
      console.warn('Error destroying Vditor:', e);
    }
    vditor = null;
  }
  
  container.innerHTML = '';
  
  vditor = new Vditor('vditor', {
    height: '100%',
    mode: mode,
    theme: 'light',
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
        current: 'light',
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
      console.log('Vditor initialized with mode:', mode);
      updateModeButtons(mode);
      if (currentContent) {
        vditor.setValue(currentContent);
      }
    },
    input: () => {
      setModified(true);
    },
  });
}

function setModified(modified) {
  isModified = modified;
  const indicator = document.getElementById('modifiedIndicator');
  if (modified) {
    indicator.classList.remove('hidden');
  } else {
    indicator.classList.add('hidden');
  }
}

function updateCurrentFileName(name) {
  document.getElementById('currentFile').textContent = name || '未命名文件';
}

function getFileHistory() {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Error reading file history:', e);
    return [];
  }
}

function saveFileHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving file history:', e);
  }
}

function addToHistory(filePath) {
  if (!filePath) return;
  
  let history = getFileHistory();
  const now = Date.now();
  const pathParts = filePath.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1];
  
  history = history.filter(item => item.path !== filePath);
  history.unshift({
    path: filePath,
    name: fileName,
    time: now
  });
  
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }
  
  saveFileHistory(history);
}

function removeFromHistory(filePath) {
  let history = getFileHistory();
  history = history.filter(item => item.path !== filePath);
  saveFileHistory(history);
  renderHistoryList();
}

function clearAllHistory() {
  saveFileHistory([]);
  renderHistoryList();
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`;
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function renderHistoryList() {
  const history = getFileHistory();
  const container = document.getElementById('historyList');
  
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-history">暂无历史文件</div>';
    return;
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
  `).join('');
  
  container.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('history-item-remove')) {
        openHistoryFile(item.dataset.path);
      }
    });
  });
  
  container.querySelectorAll('.history-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromHistory(btn.dataset.path);
    });
  });
}

function openHistoryModal() {
  renderHistoryList();
  document.getElementById('historyModal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

async function openHistoryFile(filePath) {
  try {
    if (isModified) {
      const confirmed = await confirm('当前文件未保存，是否继续打开历史文件？', {
        title: '确认',
        type: 'warning',
      });
      if (!confirmed) return;
    }
    
    const content = await readTextFile(filePath);
    vditor.setValue(content);
    currentFilePath = filePath;
    const pathParts = filePath.split(/[/\\]/);
    updateCurrentFileName(pathParts[pathParts.length - 1]);
    setModified(false);
    addToHistory(filePath);
    closeHistoryModal();
  } catch (error) {
    console.error('Error opening history file:', error);
    message('打开文件失败', { type: 'error' });
  }
}

function openPdfModal() {
  document.getElementById('pdfModal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function closePdfModal() {
  document.getElementById('pdfModal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

async function exportToPdf() {
  try {
    const content = vditor.getValue();
    if (!content.trim()) {
      message('文档内容为空，无法导出', { type: 'warning' });
      return;
    }
    
    closePdfModal();
    
    let previewHTML = '';
    const previewContent = document.querySelector('.vditor-preview__content');
    if (previewContent) {
      previewHTML = previewContent.innerHTML;
    } else {
      const preview = document.querySelector('.vditor-preview');
      if (preview) {
        const innerContent = preview.querySelector('.vditor-reset, .vditor-preview__content');
        if (innerContent) {
          previewHTML = innerContent.innerHTML;
        } else {
          previewHTML = preview.innerHTML;
        }
      }
    }
    
    if (!previewHTML) {
      message('无法获取预览内容，请尝试切换到分屏或预览模式', { type: 'error' });
      return;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = previewHTML;
    
    tempDiv.querySelectorAll('.vditor-code, .vditor-ir__preview, .vditor-reset').forEach(el => {
      el.classList.remove('vditor-code', 'vditor-ir__preview', 'vditor-reset');
    });
    
    tempDiv.querySelectorAll('[class*="vditor-"]').forEach(el => {
      const classesToRemove = Array.from(el.classList).filter(c => c.startsWith('vditor-'));
      el.classList.remove(...classesToRemove);
    });
    
    tempDiv.querySelectorAll('pre').forEach(pre => {
      const codeElement = pre.querySelector('code');
      if (codeElement) {
        const codeContent = codeElement.textContent;
        const languageClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
        pre.innerHTML = '';
        const newCode = document.createElement('code');
        if (languageClass) {
          newCode.className = languageClass;
        }
        newCode.textContent = codeContent;
        pre.appendChild(newCode);
      }
    });
    
    previewHTML = tempDiv.innerHTML;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message('无法打开打印窗口，请允许弹出窗口', { type: 'error' });
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Markdown Document</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
            color: #24292e;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            color: #24292e;
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
          }
          th, td {
            border: 1px solid #dfe2e5;
            padding: 8px 12px;
            text-align: left;
          }
          th { background-color: #f6f8fa; }
          img { max-width: 100%; height: auto; }
          a { color: #0366d6; text-decoration: none; }
          a:hover { text-decoration: underline; }
          hr {
            border: none;
            border-top: 1px solid #dfe2e5;
            margin: 2em 0;
          }
        </style>
      </head>
      <body>
        ${previewHTML}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(function() {
      printWindow.focus();
      printWindow.print();
    }, 300);
    
    message('打印窗口已打开，请选择"保存为PDF"', { type: 'info' });
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    message('导出PDF失败: ' + error.message, { type: 'error' });
  }
}

async function closeFile() {
  try {
    if (!currentFilePath && !isModified && vditor && vditor.getValue().trim() === '') {
      message('当前没有打开的文件', { type: 'info' });
      return;
    }

    if (isModified) {
      const confirmed = await confirm('当前文件未保存，确定要关闭吗？', {
        title: '确认关闭',
        type: 'warning',
      });
      if (!confirmed) return;
    }

    const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv';
    initVditor(currentMode, '');
    currentFilePath = null;
    updateCurrentFileName('未命名文件');
    setModified(false);
    message('文件已关闭', { type: 'success' });
  } catch (error) {
    console.error('Error closing file:', error);
    message('关闭文件失败: ' + error.message, { type: 'error' });
  }
}

async function newFile() {
  if (isModified) {
    const confirmed = await confirm('当前文件未保存，是否继续创建新文件？', {
      title: '确认',
      type: 'warning',
    });
    if (!confirmed) return;
  }
  const currentMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'sv';
  initVditor(currentMode, '');
  currentFilePath = null;
  updateCurrentFileName('未命名文件');
  setModified(false);
}

async function openFile() {
  try {
    if (isModified) {
      const confirmed = await confirm('当前文件未保存，是否继续打开新文件？', {
        title: '确认',
        type: 'warning',
      });
      if (!confirmed) return;
    }
    
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Markdown',
          extensions: ['md', 'markdown'],
        },
      ],
    });
    if (selected) {
      const content = await readTextFile(selected);
      vditor.setValue(content);
      currentFilePath = selected;
      const pathParts = selected.split(/[/\\]/);
      updateCurrentFileName(pathParts[pathParts.length - 1]);
      setModified(false);
      addToHistory(selected);
    }
  } catch (error) {
    console.error('Error opening file:', error);
    message('打开文件失败', { type: 'error' });
  }
}

async function saveFile() {
  if (!currentFilePath) {
    await saveAsFile();
    return;
  }
  try {
    const content = vditor.getValue();
    await writeTextFile(currentFilePath, content);
    setModified(false);
    addToHistory(currentFilePath);
    message('文件保存成功', { type: 'success' });
  } catch (error) {
    console.error('Error saving file:', error);
    message('保存文件失败', { type: 'error' });
  }
}

async function saveAsFile() {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'Markdown',
          extensions: ['md'],
        },
      ],
    });
    if (filePath) {
      const content = vditor.getValue();
      await writeTextFile(filePath, content);
      currentFilePath = filePath;
      const pathParts = filePath.split(/[/\\]/);
      updateCurrentFileName(pathParts[pathParts.length - 1]);
      setModified(false);
      addToHistory(filePath);
      message('文件保存成功', { type: 'success' });
    }
  } catch (error) {
    console.error('Error saving file:', error);
    message('保存文件失败', { type: 'error' });
  }
}

function updateModeButtons(mode) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

function switchMode(mode) {
  try {
    console.log('Switching to mode:', mode);
    let currentContent = '';
    if (vditor) {
      try {
        currentContent = vditor.getValue();
      } catch (e) {
        console.warn('Error getting content before mode switch:', e);
      }
    }
    initVditor(mode, currentContent);
    console.log('Mode switched successfully');
  } catch (error) {
    console.error('Failed to switch mode:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initVditor('sv', '');

  document.getElementById('newFile').addEventListener('click', newFile);
  document.getElementById('openFile').addEventListener('click', openFile);
  document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
  document.getElementById('saveFile').addEventListener('click', saveFile);
  document.getElementById('saveAsFile').addEventListener('click', saveAsFile);
  document.getElementById('closeFile').addEventListener('click', closeFile);
  document.getElementById('exportPdf').addEventListener('click', openPdfModal);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  document.getElementById('closeHistoryModal').addEventListener('click', closeHistoryModal);
  document.getElementById('clearAllHistory').addEventListener('click', async () => {
    const confirmed = await confirm('确定要清除全部历史记录吗？', {
      title: '确认',
      type: 'warning',
    });
    if (confirmed) {
      clearAllHistory();
      message('已清除全部历史记录', { type: 'success' });
    }
  });

  document.getElementById('closePdfModal').addEventListener('click', closePdfModal);
  document.getElementById('cancelPdf').addEventListener('click', closePdfModal);
  document.getElementById('confirmPdf').addEventListener('click', exportToPdf);

  document.getElementById('overlay').addEventListener('click', () => {
    closeHistoryModal();
    closePdfModal();
  });

  document.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (e.shiftKey) {
        await saveAsFile();
      } else {
        await saveFile();
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      await newFile();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      await openFile();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault();
      await closeFile();
    }
    if (e.key === 'Escape') {
      closeHistoryModal();
      closePdfModal();
    }
  });

  appWindow.onCloseRequested((event) => {
    if (isModified) {
      event.preventDefault();
      confirm('文件尚未保存，确定要退出吗？', {
        title: '确认退出',
        type: 'warning'
      }).then((confirmed) => {
        if (confirmed) {
          appWindow.close();
        }
      });
    }
  });
});
