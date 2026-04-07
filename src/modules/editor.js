import Vditor from 'vditor'
import { getCurrentTheme, updateVditorTheme, setVditorInstance as setThemeVditorInstance } from './themeManager.js'
import { setVditorInstance as setFileManagerVditorInstance } from './fileManager.js'

let vditor = null
let currentMode = 'sv'

const vditorI18n = {
  'zh-CN': {
    'alignCenter': '居中',
    'alignLeft': '居左',
    'alignRight': '居右',
    'alternateText': '替代文本',
    'bold': '粗体',
    'both': '编辑 & 预览',
    'cancelUpload': '取消上传',
    'check': '任务列表',
    'close': '关闭',
    'code': '代码块',
    'code-theme': '代码块主题预览',
    'column': '列',
    'comment': '评论',
    'confirm': '确定',
    'content-theme': '内容主题预览',
    'copied': '已复制',
    'copy': '复制',
    'delete-column': '删除列',
    'delete-row': '删除行',
    'devtools': '开发者工具',
    'down': '下',
    'downloadTip': '该浏览器不支持下载功能',
    'edit': '编辑',
    'edit-mode': '切换编辑模式',
    'emoji': '表情',
    'export': '导出',
    'fileTypeError': '文件类型不允许上传，请压缩后再试',
    'footnoteRef': '脚注标识',
    'fullscreen': '全屏切换',
    'generate': '生成中',
    'headings': '标题',
    'heading1': '一级标题',
    'heading2': '二级标题',
    'heading3': '三级标题',
    'heading4': '四级标题',
    'heading5': '五级标题',
    'heading6': '六级标题',
    'help': '帮助',
    'imageURL': '图片地址',
    'indent': '列表缩进',
    'info': '关于',
    'inline-code': '行内代码',
    'insert-after': '末尾插入行',
    'insert-before': '起始插入行',
    'insertColumnLeft': '在左边插入一列',
    'insertColumnRight': '在右边插入一列',
    'insertRowAbove': '在上方插入一行',
    'insertRowBelow': '在下方插入一行',
    'instantRendering': '即时渲染',
    'italic': '斜体',
    'language': '语言',
    'line': '分隔线',
    'link': '链接',
    'linkRef': '引用标识',
    'list': '无序列表',
    'more': '更多',
    'nameEmpty': '文件名不能为空',
    'ordered-list': '有序列表',
    'outdent': '列表反向缩进',
    'outline': '大纲',
    'over': '超过',
    'performanceTip': '实时预览需 ${x}ms，可点击编辑 & 预览按钮进行关闭',
    'preview': '预览',
    'quote': '引用',
    'record': '开始录音/结束录音',
    'record-tip': '该设备不支持录音功能',
    'recording': '录音中...',
    'redo': '重做',
    'remove': '删除',
    'row': '行',
    'spin': '旋转',
    'splitView': '分屏预览',
    'strike': '删除线',
    'table': '表格',
    'textIsNotEmpty': '文本（不能为空）',
    'title': '标题',
    'tooltipText': '提示文本',
    'undo': '撤销',
    'up': '上',
    'update': '更新',
    'upload': '上传图片或文件',
    'uploadError': '上传错误',
    'uploading': '上传中...',
    'wysiwyg': '所见即所得',
  },
  'en-US': {
    'alignCenter': 'Align center',
    'alignLeft': 'Align left',
    'alignRight': 'Align right',
    'alternateText': 'Alternate text',
    'bold': 'Bold',
    'both': 'Edit & Preview',
    'cancelUpload': 'Cancel upload',
    'check': 'Task list',
    'close': 'Close',
    'code': 'Code block',
    'code-theme': 'Code theme preview',
    'column': 'Column',
    'comment': 'Comment',
    'confirm': 'Confirm',
    'content-theme': 'Content theme preview',
    'copied': 'Copied',
    'copy': 'Copy',
    'delete-column': 'Delete column',
    'delete-row': 'Delete row',
    'devtools': 'Developer tools',
    'down': 'Down',
    'downloadTip': 'This browser does not support download',
    'edit': 'Edit',
    'edit-mode': 'Switch edit mode',
    'emoji': 'Emoji',
    'export': 'Export',
    'fileTypeError': 'File type not allowed, please compress and try again',
    'footnoteRef': 'Footnote reference',
    'fullscreen': 'Toggle fullscreen',
    'generate': 'Generating',
    'headings': 'Headings',
    'heading1': 'Heading 1',
    'heading2': 'Heading 2',
    'heading3': 'Heading 3',
    'heading4': 'Heading 4',
    'heading5': 'Heading 5',
    'heading6': 'Heading 6',
    'help': 'Help',
    'imageURL': 'Image URL',
    'indent': 'Indent',
    'info': 'About',
    'inline-code': 'Inline code',
    'insert-after': 'Insert row after',
    'insert-before': 'Insert row before',
    'insertColumnLeft': 'Insert column left',
    'insertColumnRight': 'Insert column right',
    'insertRowAbove': 'Insert row above',
    'insertRowBelow': 'Insert row below',
    'instantRendering': 'Instant rendering',
    'italic': 'Italic',
    'language': 'Language',
    'line': 'Divider',
    'link': 'Link',
    'linkRef': 'Link reference',
    'list': 'Unordered list',
    'more': 'More',
    'nameEmpty': 'Filename cannot be empty',
    'ordered-list': 'Ordered list',
    'outdent': 'Outdent',
    'outline': 'Outline',
    'over': 'Over',
    'performanceTip': 'Live preview takes ${x}ms, you can click Edit & Preview to disable',
    'preview': 'Preview',
    'quote': 'Quote',
    'record': 'Start/stop recording',
    'record-tip': 'This device does not support recording',
    'recording': 'Recording...',
    'redo': 'Redo',
    'remove': 'Remove',
    'row': 'Row',
    'spin': 'Spin',
    'splitView': 'Split view',
    'strike': 'Strikethrough',
    'table': 'Table',
    'textIsNotEmpty': 'Text (cannot be empty)',
    'title': 'Title',
    'tooltipText': 'Tooltip text',
    'undo': 'Undo',
    'up': 'Up',
    'update': 'Update',
    'upload': 'Upload image or file',
    'uploadError': 'Upload error',
    'uploading': 'Uploading...',
    'wysiwyg': 'WYSIWYG',
  }
}

export function getVditor() {
  return vditor
}

export function getCurrentMode() {
  return currentMode
}

export function setCurrentMode(mode) {
  currentMode = mode
}

export function initVditor(mode = 'sv', initialContent = '') {
  console.log('[editor] initVditor called with mode:', mode, 'initialContent length:', initialContent.length)
  console.log('[editor] initialContent preview:', initialContent.substring(0, 100))
  
  const container = document.getElementById('vditor')
  const currentTheme = getCurrentTheme()
  const vditorTheme = currentTheme === 'dark' ? 'dark' : 'light'
  
  let currentContent = initialContent
  if (vditor) {
    try {
      if (initialContent === '') {
        currentContent = ''
      }
    } catch (e) {
      console.warn('[editor] Error handling content:', e)
    }
    try {
      vditor.destroy()
    } catch (e) {
      console.warn('[editor] Error destroying Vditor:', e)
    }
    vditor = null
  }
  
  container.innerHTML = ''
  
  console.log('[editor] Creating Vditor with simple config...')
  console.log('[editor] Current content to set:', currentContent.substring(0, 100))
  
  vditor = new Vditor('vditor', {
    height: '100%',
    mode: mode,
    theme: vditorTheme,
    value: currentContent,
    cache: {
      enable: false,
    },
    i18n: vditorI18n['zh-CN'],
    after: () => {
      console.log('[editor] Vditor initialized with mode:', mode)
      updateModeButtons(mode)
      console.log('[editor] Vditor value after init:', vditor.getValue().substring(0, 100))
    },
    input: () => {
    },
  })

  setThemeVditorInstance(vditor)
  setFileManagerVditorInstance(vditor)
  currentMode = mode
}

export function updateModeButtons(mode) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  const activeBtn = document.querySelector(`[data-mode="${mode}"]`)
  if (activeBtn) {
    activeBtn.classList.add('active')
  }
}

export async function switchMode(mode) {
  try {
    console.log('Switching to mode:', mode)
    let currentContent = ''
    if (vditor) {
      try {
        currentContent = vditor.getValue()
      } catch (e) {
        console.warn('Error getting content before mode switch:', e)
      }
    }
    initVditor(mode, currentContent)
    console.log('Mode switched successfully')
  } catch (error) {
    console.error('Failed to switch mode:', error)
  }
}
