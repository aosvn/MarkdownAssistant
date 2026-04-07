import { message } from '@tauri-apps/api/dialog'

let initErrorHandlingCalled = false
let tFunction = null

export function setErrorHandlerI18n(t) {
  tFunction = t
}

export function initErrorHandling() {
  if (initErrorHandlingCalled) {
    return
  }
  initErrorHandlingCalled = true

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    showErrorNotification('messages.error.generic')
    logError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    showErrorNotification('messages.error.operationFailed')
    logError(event.reason)
  })
}

export function showErrorNotification(msgKey) {
  let msg = msgKey
  if (tFunction) {
    try {
      msg = tFunction(msgKey)
    } catch (e) {
      console.warn('Failed to translate error message:', e)
    }
  }
  message(msg, { type: 'error', duration: 5000 })
}

export function logError(error) {
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack,
      url: window.location.href
    }
    
    console.error('Error logged:', errorLog)
  } catch (e) {
    console.error('Failed to log error:', e)
  }
}
