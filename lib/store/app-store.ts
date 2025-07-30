// Global state management dengan Zustand untuk Aplikasi Simulasi AI Otomotif

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { SensorData, SensorConfig, DEFAULT_SENSOR_RANGES } from '@/lib/types/sensor'
import { DetectionResult, AIModel, DEFAULT_AI_MODEL } from '@/lib/types/ai-detection'
import { LearningModule, UserProgress, QuizResult } from '@/lib/types/learning'
import { ArduinoProject, SerialMessage } from '@/lib/types/arduino'

// Interface untuk state aplikasi
interface AppState {
  // Sensor simulation state
  sensors: {
    data: SensorData[]
    currentData: SensorData | null
    config: SensorConfig
    isRunning: boolean
    ranges: typeof DEFAULT_SENSOR_RANGES
  }
  
  // AI detection state
  ai: {
    results: DetectionResult[]
    currentAnalysis: DetectionResult[] | null
    model: AIModel
    isAnalyzing: boolean
    lastAnalysisTime: Date | null
  }
  
  // Learning modules state
  learning: {
    modules: LearningModule[]
    currentModule: string | null
    progress: Record<string, UserProgress>
    quizResults: QuizResult[]
    isLoading: boolean
  }
  
  // Arduino state
  arduino: {
    currentProject: ArduinoProject | null
    projects: ArduinoProject[]
    serialMonitor: SerialMessage[]
    isCompiling: boolean
    isRunning: boolean
  }
  
  // UI state
  ui: {
    theme: 'light' | 'dark' | 'system'
    activeTab: string
    notifications: Notification[]
    isLoading: boolean
    sidebarOpen: boolean
  }
}

// Interface untuk actions
interface AppActions {
  // Sensor actions
  setSensorData: (data: SensorData[]) => void
  addSensorData: (data: SensorData) => void
  setCurrentSensorData: (data: SensorData) => void
  updateSensorConfig: (config: Partial<SensorConfig>) => void
  startSensorSimulation: () => void
  stopSensorSimulation: () => void
  clearSensorData: () => void
  
  // AI detection actions
  setAIResults: (results: DetectionResult[]) => void
  addAIResult: (result: DetectionResult) => void
  setCurrentAnalysis: (analysis: DetectionResult[]) => void
  updateAIModel: (model: Partial<AIModel>) => void
  startAIAnalysis: () => void
  stopAIAnalysis: () => void
  
  // Learning actions
  setLearningModules: (modules: LearningModule[]) => void
  setCurrentModule: (moduleId: string | null) => void
  updateUserProgress: (moduleId: string, progress: UserProgress) => void
  addQuizResult: (result: QuizResult) => void
  setLearningLoading: (loading: boolean) => void
  
  // Arduino actions
  setArduinoProjects: (projects: ArduinoProject[]) => void
  setCurrentProject: (project: ArduinoProject | null) => void
  updateCurrentProject: (updates: Partial<ArduinoProject>) => void
  addSerialMessage: (message: SerialMessage) => void
  clearSerialMonitor: () => void
  setCompiling: (compiling: boolean) => void
  setRunning: (running: boolean) => void
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setActiveTab: (tab: string) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Default state
const defaultState: AppState = {
  sensors: {
    data: [],
    currentData: null,
    config: {
      samplingRate: 1000, // 1 detik
      noiseLevel: 0.1,
      faultInjection: false,
      autoSave: true
    },
    isRunning: false,
    ranges: DEFAULT_SENSOR_RANGES
  },
  ai: {
    results: [],
    currentAnalysis: null,
    model: DEFAULT_AI_MODEL,
    isAnalyzing: false,
    lastAnalysisTime: null
  },
  learning: {
    modules: [],
    currentModule: null,
    progress: {},
    quizResults: [],
    isLoading: false
  },
  arduino: {
    currentProject: null,
    projects: [],
    serialMonitor: [],
    isCompiling: false,
    isRunning: false
  },
  ui: {
    theme: 'system',
    activeTab: 'dashboard',
    notifications: [],
    isLoading: false,
    sidebarOpen: false
  }
}

// Create store dengan Zustand
export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set) => ({
        ...defaultState,
        
        // Sensor actions
        setSensorData: (data) => set((state) => ({
          sensors: { ...state.sensors, data }
        })),
        
        addSensorData: (data) => set((state) => ({
          sensors: {
            ...state.sensors,
            data: [data, ...state.sensors.data].slice(0, 1000) // Keep last 1000 readings
          }
        })),
        
        setCurrentSensorData: (data) => set((state) => ({
          sensors: { ...state.sensors, currentData: data }
        })),
        
        updateSensorConfig: (config) => set((state) => ({
          sensors: {
            ...state.sensors,
            config: { ...state.sensors.config, ...config }
          }
        })),
        
        startSensorSimulation: () => set((state) => ({
          sensors: { ...state.sensors, isRunning: true }
        })),
        
        stopSensorSimulation: () => set((state) => ({
          sensors: { ...state.sensors, isRunning: false }
        })),
        
        clearSensorData: () => set((state) => ({
          sensors: { ...state.sensors, data: [], currentData: null }
        })),
        
        // AI detection actions
        setAIResults: (results) => set((state) => ({
          ai: { ...state.ai, results }
        })),
        
        addAIResult: (result) => set((state) => ({
          ai: {
            ...state.ai,
            results: [result, ...state.ai.results].slice(0, 100) // Keep last 100 results
          }
        })),
        
        setCurrentAnalysis: (analysis) => set((state) => ({
          ai: { ...state.ai, currentAnalysis: analysis }
        })),
        
        updateAIModel: (model) => set((state) => ({
          ai: {
            ...state.ai,
            model: { ...state.ai.model, ...model }
          }
        })),
        
        startAIAnalysis: () => set((state) => ({
          ai: { ...state.ai, isAnalyzing: true }
        })),
        
        stopAIAnalysis: () => set((state) => ({
          ai: { ...state.ai, isAnalyzing: false, lastAnalysisTime: new Date() }
        })),
        
        // Learning actions
        setLearningModules: (modules) => set((state) => ({
          learning: { ...state.learning, modules }
        })),
        
        setCurrentModule: (moduleId) => set((state) => ({
          learning: { ...state.learning, currentModule: moduleId }
        })),
        
        updateUserProgress: (moduleId, progress) => set((state) => ({
          learning: {
            ...state.learning,
            progress: { ...state.learning.progress, [moduleId]: progress }
          }
        })),
        
        addQuizResult: (result) => set((state) => ({
          learning: {
            ...state.learning,
            quizResults: [...state.learning.quizResults, result]
          }
        })),
        
        setLearningLoading: (loading) => set((state) => ({
          learning: { ...state.learning, isLoading: loading }
        })),
        
        // Arduino actions
        setArduinoProjects: (projects) => set((state) => ({
          arduino: { ...state.arduino, projects }
        })),
        
        setCurrentProject: (project) => set((state) => ({
          arduino: { ...state.arduino, currentProject: project }
        })),
        
        updateCurrentProject: (updates) => set((state) => ({
          arduino: {
            ...state.arduino,
            currentProject: state.arduino.currentProject
              ? { ...state.arduino.currentProject, ...updates }
              : null
          }
        })),
        
        addSerialMessage: (message) => set((state) => ({
          arduino: {
            ...state.arduino,
            serialMonitor: [...state.arduino.serialMonitor, message].slice(-100) // Keep last 100 messages
          }
        })),
        
        clearSerialMonitor: () => set((state) => ({
          arduino: { ...state.arduino, serialMonitor: [] }
        })),
        
        setCompiling: (compiling) => set((state) => ({
          arduino: { ...state.arduino, isCompiling: compiling }
        })),
        
        setRunning: (running) => set((state) => ({
          arduino: { ...state.arduino, isRunning: running }
        })),
        
        // UI actions
        setTheme: (theme) => set((state) => ({
          ui: { ...state.ui, theme }
        })),
        
        setActiveTab: (tab) => set((state) => ({
          ui: { ...state.ui, activeTab: tab }
        })),
        
        addNotification: (notification) => set((state) => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, notification]
          }
        })),
        
        removeNotification: (id) => set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id)
          }
        })),
        
        setLoading: (loading) => set((state) => ({
          ui: { ...state.ui, isLoading: loading }
        })),
        
        setSidebarOpen: (open) => set((state) => ({
          ui: { ...state.ui, sidebarOpen: open }
        }))
      }),
      {
        name: 'automotive-ai-simulator-storage',
        partialize: (state) => ({
          sensors: {
            config: state.sensors.config,
            ranges: state.sensors.ranges
          },
          ai: {
            model: state.ai.model
          },
          learning: {
            progress: state.learning.progress
          },
          ui: {
            theme: state.ui.theme,
            activeTab: state.ui.activeTab
          }
        })
      }
    ),
    {
      name: 'automotive-ai-simulator'
    }
  )
)