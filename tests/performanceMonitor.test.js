import { describe, it, expect, beforeEach, vi } from 'vitest'
import perfMonitor from '../src/utils/performanceMonitor.js'

describe('performanceMonitor.js', () => {
  beforeEach(() => {
    perfMonitor.clear()
  })

  describe('mark and measure', () => {
    it('should create a performance mark', () => {
      perfMonitor.mark('test_start')
      expect(perfMonitor.getMetric('test_start')).toBeUndefined()
    })

    it('should measure time between marks', () => {
      perfMonitor.mark('start')
      perfMonitor.measure('test', 'start')
      const metric = perfMonitor.getMetric('test')
      expect(metric).toBeDefined()
      expect(metric.unit).toBe('ms')
    })
  })

  describe('metrics', () => {
    it('should add custom metric', () => {
      perfMonitor.addMetric('test_metric', 100, 'count')
      const metric = perfMonitor.getMetric('test_metric')
      expect(metric).toEqual({
        name: 'test_metric',
        value: 100,
        unit: 'count',
        timestamp: expect.any(Number)
      })
    })

    it('should get all metrics', () => {
      perfMonitor.addMetric('metric1', 10)
      perfMonitor.addMetric('metric2', 20)
      const metrics = perfMonitor.getAllMetrics()
      expect(metrics.length).toBe(2)
    })
  })

  describe('report', () => {
    it('should generate performance report', () => {
      perfMonitor.addMetric('test', 100)
      const report = perfMonitor.getReport()
      expect(report.startTime).toBeDefined()
      expect(report.endTime).toBeDefined()
      expect(report.metrics.length).toBe(1)
    })
  })

  describe('measureFunction', () => {
    it('should measure async function execution', async () => {
      const result = await perfMonitor.measureFunction('test_fn', async () => {
        return 'test result'
      })
      expect(result).toBe('test result')
      const metric = perfMonitor.getMetric('test_fn')
      expect(metric).toBeDefined()
    })
  })
})
