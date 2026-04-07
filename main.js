import Vditor from 'vditor';
import { open, save, confirm, message } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window';

let vditor;
let currentFilePath = null;
let isModified = false;

function initVditor(mode = 'sv') {
  const container = document.getElementById('vditor');
  
  let currentContent = '';
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
      enable: true,
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

async function newFile() {
  if (isModified) {
    const confirmed = await confirm('当前文件未保存，是否继续创建新文件？', {
      title: '确认',
      type: 'warning',
    });
    if (!confirmed) return;
  }
  vditor.setValue('');
  currentFilePath = null;
  updateCurrentFileName('未命名文件');
  setModified(false);
}

async function openFile() {
  try {
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
    initVditor(mode);
    console.log('Mode switched successfully');
  } catch (error) {
    console.error('Failed to switch mode:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initVditor('sv');

  document.getElementById('newFile').addEventListener('click', newFile);
  document.getElementById('openFile').addEventListener('click', openFile);
  document.getElementById('saveFile').addEventListener('click', saveFile);
  document.getElementById('saveAsFile').addEventListener('click', saveAsFile);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
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
