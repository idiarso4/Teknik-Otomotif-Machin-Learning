// Types untuk sistem pembelajaran

export interface LearningModule {
  id: string
  title: string
  category: ModuleCategory
  description: string
  content: ModuleContent
  progress?: UserProgress
  estimatedTime: number     // Estimasi waktu (menit)
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export type ModuleCategory = 'electrical' | 'cooling' | 'fuel' | 'vibration'

export interface ModuleContent {
  theory: TheoryContent
  simulation: SimulationConfig
  codeExamples: CodeExample[]
  quiz: QuizQuestion[]
}

export interface TheoryContent {
  sections: TheorySection[]
  images?: string[]
  videos?: string[]
}

export interface TheorySection {
  title: string
  content: string
  subsections?: TheorySection[]
}

export interface SimulationConfig {
  type: 'sensor' | 'circuit' | 'diagnostic'
  parameters: Record<string, any>
  scenarios: SimulationScenario[]
}

export interface SimulationScenario {
  name: string
  description: string
  initialValues: Record<string, number>
  faults?: FaultScenario[]
}

export interface FaultScenario {
  name: string
  description: string
  parameters: Record<string, number>
  expectedSymptoms: string[]
}

export interface CodeExample {
  title: string
  description: string
  language: 'arduino' | 'cpp' | 'javascript'
  code: string
  explanation: string
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'code-completion'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  points: number
}

export interface UserProgress {
  id?: number
  moduleId: string
  userSession: string
  completionPercentage: number
  quizScores: QuizResult[]
  lastAccessed: Date
}

export interface QuizResult {
  questionId: string
  userAnswer: string | number
  isCorrect: boolean
  points: number
  timeSpent: number        // Waktu dalam detik
}

// Kategori modul pembelajaran
export const MODULE_CATEGORIES = {
  electrical: {
    name: 'Sistem Kelistrikan',
    description: 'Pembelajaran sistem kelistrikan otomotif',
    icon: 'Zap'
  },
  cooling: {
    name: 'Sistem Pendingin',
    description: 'Pembelajaran sistem pendingin mesin',
    icon: 'Thermometer'
  },
  fuel: {
    name: 'Sistem Bahan Bakar',
    description: 'Pembelajaran sistem bahan bakar',
    icon: 'Fuel'
  },
  vibration: {
    name: 'Getaran & Noise',
    description: 'Analisis getaran dan kebisingan',
    icon: 'Activity'
  }
} as const