// Real-time data streaming service for sensor data

import { SensorData } from '@/lib/types/sensor'

export interface DataStreamConfig {
  bufferSize: number
  maxRetries: number
  retryDelay: number
  compressionEnabled: boolean
}

export interface StreamMetrics {
  totalDataPoints: number
  averageLatency: number
  droppedPackets: number
  compressionRatio: number
  lastUpdateTime: Date
}

export class DataStreamingService {
  private buffer: SensorData[] = []
  private subscribers: Set<(data: SensorData) => void> = new Set()
  private config: DataStreamConfig
  private metrics: StreamMetrics
  private isStreaming: boolean = false

  constructor(config?: Partial<DataStreamConfig>) {
    this.config = {
      bufferSize: 1000,
      maxRetries: 3,
      retryDelay: 1000,
      compressionEnabled: true,
      ...config
    }

    this.metrics = {
      totalDataPoints: 0,
      averageLatency: 0,
      droppedPackets: 0,
      compressionRatio: 1.0,
      lastUpdateTime: new Date()
    }
  }

  // Subscribe to real-time data stream
  subscribe(callback: (data: SensorData) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Start streaming data
  startStreaming(): void {
    this.isStreaming = true
    console.log('Data streaming started')
  }

  // Stop streaming data
  stopStreaming(): void {
    this.isStreaming = false
    this.buffer = []
    console.log('Data streaming stopped')
  }

  // Push new sensor data to stream
  pushData(data: SensorData): void {
    if (!this.isStreaming) return

    const startTime = performance.now()

    try {
      // Add to buffer
      this.buffer.push(data)
      
      // Maintain buffer size
      if (this.buffer.length > this.config.bufferSize) {
        this.buffer.shift()
      }

      // Notify all subscribers
      this.subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in stream subscriber:', error)
        }
      })

      // Update metrics
      this.updateMetrics(startTime)

    } catch (error) {
      console.error('Error pushing data to stream:', error)
      this.metrics.droppedPackets++
    }
  }

  // Get buffered data
  getBufferedData(limit?: number): SensorData[] {
    if (limit) {
      return this.buffer.slice(-limit)
    }
    return [...this.buffer]
  }

  // Get streaming metrics
  getMetrics(): StreamMetrics {
    return { ...this.metrics }
  }

  // Clear buffer
  clearBuffer(): void {
    this.buffer = []
    console.log('Stream buffer cleared')
  }

  // Update streaming metrics
  private updateMetrics(startTime: number): void {
    const latency = performance.now() - startTime
    
    this.metrics.totalDataPoints++
    this.metrics.averageLatency = (
      (this.metrics.averageLatency * (this.metrics.totalDataPoints - 1) + latency) / 
      this.metrics.totalDataPoints
    )
    this.metrics.lastUpdateTime = new Date()

    // Calculate compression ratio if enabled
    if (this.config.compressionEnabled) {
      this.metrics.compressionRatio = this.calculateCompressionRatio()
    }
  }

  // Calculate compression ratio (simplified)
  private calculateCompressionRatio(): number {
    if (this.buffer.length === 0) return 1.0
    
    // Simple compression ratio calculation based on data redundancy
    const uniqueValues = new Set(this.buffer.map(d => 
      `${d.engineTemp}-${d.oilPressure}-${d.batteryVoltage}-${d.engineVibration}-${d.rpm}`
    ))
    
    return this.buffer.length / uniqueValues.size
  }

  // Get stream status
  getStatus(): {
    isStreaming: boolean
    bufferSize: number
    subscriberCount: number
    config: DataStreamConfig
  } {
    return {
      isStreaming: this.isStreaming,
      bufferSize: this.buffer.length,
      subscriberCount: this.subscribers.size,
      config: { ...this.config }
    }
  }
}

// Global streaming service instance
export const dataStreamingService = new DataStreamingService()

// Hook for using data streaming
export function useDataStreaming() {
  return {
    service: dataStreamingService,
    subscribe: dataStreamingService.subscribe.bind(dataStreamingService),
    startStreaming: dataStreamingService.startStreaming.bind(dataStreamingService),
    stopStreaming: dataStreamingService.stopStreaming.bind(dataStreamingService),
    pushData: dataStreamingService.pushData.bind(dataStreamingService),
    getBufferedData: dataStreamingService.getBufferedData.bind(dataStreamingService),
    getMetrics: dataStreamingService.getMetrics.bind(dataStreamingService),
    clearBuffer: dataStreamingService.clearBuffer.bind(dataStreamingService),
    getStatus: dataStreamingService.getStatus.bind(dataStreamingService)
  }
}