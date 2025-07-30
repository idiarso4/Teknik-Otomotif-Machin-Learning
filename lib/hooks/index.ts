// Centralized exports for all hooks

export { useSensorData, useSensorConfig } from './use-sensor-data'
export { useAIDetection } from './use-ai-detection'
export { useLearning } from './use-learning'
export { useArduino } from './use-arduino'
export { useNotifications, useUI } from './use-notifications'
export { 
  useAppIntegration, 
  useSystemHealth, 
  usePerformanceMonitor 
} from './use-app-integration'

// Re-export store for convenience
export { useAppStore } from '@/lib/store/app-store'