import { message } from '@tauri-apps/api/dialog'

let initErrorHandlingCalled = false

export function initErrorHandling() {
  if (initErrorHandlingCalled) {
    return
  }
  initErrorHandlingCalled = true

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    logError(event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    logError(event.reason)
  })
}

export function showErrorNotification(msg) {
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
