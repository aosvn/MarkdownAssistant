/**
 * 字数统计示例插件
 * 演示如何创建和使用插件系统
 */

let wordCount = 0
let charCount = 0

const wordCounterPlugin = {
  name: 'wordCounter',
  version: '1.0.0',
  description: '字数统计插件',
  
  hooks: {
    onInit(context) {
      console.log('[WordCounter] Plugin initialized')
    },
    
    onEditorChange(content) {
      if (!content) {
        wordCount = 0
        charCount = 0
        return
      }
      
      charCount = content.length
      wordCount = content.split(/\s+/).filter(word => word.length > 0).length
      
      console.log(`[WordCounter] Words: ${wordCount}, Characters: ${charCount}`)
    }
  },
  
  api: {
    getWordCount() {
      return wordCount
    },
    
    getCharCount() {
      return charCount
    },
    
    getStats() {
      return {
        words: wordCount,
        characters: charCount
      }
    }
  }
}

export default wordCounterPlugin
