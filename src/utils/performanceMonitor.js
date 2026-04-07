/**
 * 性能监控模块
 * 提供应用程序性能指标收集和监控功能
 */

/**
 * @typedef {Object} PerformanceMetric
 * @property {string} name - 指标名称
 * @property {number} value - 指标值
 * @property {string} unit - 指标单位
 * @property {number} timestamp - 时间戳
 */

/**
 * @typedef {Object} PerformanceReport
 * @property {PerformanceMetric[]} metrics - 性能指标数组
 * @property {number} startTime - 开始时间
 * @property {number} endTime - 结束时间
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = []
    this.startTime = Date.now()
    this.marks = new Map()
    this.measures = new Map()
  }

  /**
   * 开始一个性能标记
   * @param {string} name - 标记名称
   */
  mark(name) {
    const timestamp = Date.now()
    this.marks.set(name, timestamp)
    console.log(`[Performance] Mark: ${name} at ${timestamp}`)
  }

  /**
   * 结束一个性能标记并记录测量值
   * @param {string} name - 测量名称
   * @param {string} startMark - 开始标记名称
   * @param {string} [endMark] - 结束标记名称（可选，默认为当前时间）
   */
  measure(name, startMark, endMark) {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`[Performance] Start mark '${startMark}' not found`)
      return
    }

    const endTime = endMark ? this.marks.get(endMark) : Date.now()
    if (endMark && !endTime) {
      console.warn(`[Performance] End mark '${endMark}' not found`)
      return
    }

    const duration = endTime - startTime
    this.measures.set(name, duration)
    
    this.addMetric(name, duration, 'ms')
    console.log(`[Performance] Measure: ${name} = ${duration}ms`)
  }

  /**
   * 添加自定义性能指标
   * @param {string} name - 指标名称
   * @param {number} value - 指标值
   * @param {string} [unit=''] - 指标单位
   */
  addMetric(name, value, unit = '') {
    const metric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    }
    this.metrics.push(metric)
  }

  /**
   * 获取特定指标
   * @param {string} name - 指标名称
   * @returns {PerformanceMetric|undefined}
   */
  getMetric(name) {
    return this.metrics.find(m => m.name === name)
  }

  /**
   * 获取所有指标
   * @returns {PerformanceMetric[]}
   */
  getAllMetrics() {
    return [...this.metrics]
  }

  /**
   * 获取性能报告
   * @returns {PerformanceReport}
   */
  getReport() {
    return {
      metrics: this.getAllMetrics(),
      startTime: this.startTime,
      endTime: Date.now()
    }
  }

  /**
   * 打印性能报告到控制台
   */
  printReport() {
    const report = this.getReport()
    console.group('📊 Performance Report')
    console.log('Start Time:', new Date(report.startTime).toLocaleString())
    console.log('End Time:', new Date(report.endTime).toLocaleString())
    console.log('Duration:', (report.endTime - report.startTime) / 1000, 's')
    console.log('Metrics:')
    report.metrics.forEach(metric => {
      console.log(`  - ${metric.name}: ${metric.value}${metric.unit}`)
    })
    console.groupEnd()
  }

  /**
   * 清除所有性能数据
   */
  clear() {
    this.metrics = []
    this.marks.clear()
    this.measures.clear()
    this.startTime = Date.now()
  }

  /**
   * 测量函数执行时间
   * @param {string} name - 测量名称
   * @param {Function} fn - 要测量的函数
   * @returns {Promise<any>} 函数返回值
   */
  async measureFunction(name, fn) {
    this.mark(`${name}_start`)
    try {
      const result = await fn()
      this.measure(name, `${name}_start`)
      return result
    } catch (error) {
      this.measure(name, `${name}_start`)
      throw error
    }
  }

  /**
   * 获取内存使用情况（如果可用）
   * @returns {Object|null} 内存信息
   */
  getMemoryInfo() {
    if (performance && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      }
    }
    return null
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage() {
    const memoryInfo = this.getMemoryInfo()
    if (memoryInfo) {
      this.addMetric('memory_used', memoryInfo.usedJSHeapSize / 1024 / 1024, 'MB')
      this.addMetric('memory_total', memoryInfo.totalJSHeapSize / 1024 / 1024, 'MB')
    }
  }
}

export const perfMonitor = new PerformanceMonitor()

export default perfMonitor
