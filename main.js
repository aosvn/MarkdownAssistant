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
    const pageSize = document.getElementById('pdfPageSize').value;
    const orientation = document.getElementById('pdfOrientation').value;
    const margin = document.getElementById('pdfMargin').value;
    
    const content = vditor.getValue();
    if (!content.trim()) {
      message('文档内容为空，无法导出', { type: 'warning' });
      return;
    }
    
    let defaultFileName = 'document.pdf';
    if (currentFilePath) {
      const pathParts = currentFilePath.split(/[/\\]/);
      const fileName = pathParts[pathParts.length - 1].replace(/\.(md|markdown)$/i, '');
      defaultFileName = `${fileName}.pdf`;
    }
    
    const filePath = await save({
      filters: [
        {
          name: 'PDF',
          extensions: ['pdf'],
        },
      ],
      defaultPath: defaultFileName,
    });
    
    if (!filePath) return;
    
    closePdfModal();
    
    const marginMap = {
      default: 20,
      minimum: 10,
      none: 0
    };
    
    const opt = {
      margin: marginMap[margin],
      filename: defaultFileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: pageSize, orientation: orientation }
    };
    
    message('正在生成PDF...', { type: 'info' });
    
    const previewElement = document.querySelector('.vditor-preview, .vditor-content, .vditor');
    
    if (!previewElement) {
      message('无法获取预览内容，请尝试切换到预览模式', { type: 'error' });
      return;
    }
    
    const elementToExport = previewElement.cloneNode(true);
    elementToExport.style.position = 'absolute';
    elementToExport.style.left = '-9999px';
    elementToExport.style.top = '0';
    elementToExport.style.width = '800px';
    elementToExport.style.backgroundColor = 'white';
    elementToExport.style.padding = '20px';
    elementToExport.style.zIndex = '-1';
    document.body.appendChild(elementToExport);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const blob = await html2pdf().from(elementToExport).set(opt).outputPdf('blob');
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      await writeBinaryFile(filePath, uint8Array);
      message('PDF导出成功！', { type: 'success' });
    } finally {
      document.body.removeChild(elementToExport);
    }
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    message('导出PDF失败: ' + error.message, { type: 'error' });
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
