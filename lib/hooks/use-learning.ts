// Custom hooks untuk learning module system

import { useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store/app-store'
import { LearningModule, UserProgress, QuizResult, MODULE_CATEGORIES } from '@/lib/types/learning'
import { DatabaseService } from '@/lib/database'

// Sample learning modules data
const SAMPLE_MODULES: LearningModule[] = [
  {
    id: 'electrical-basics',
    title: 'Dasar-dasar Sistem Kelistrikan Otomotif',
    category: 'electrical',
    description: 'Pelajari komponen dasar sistem kelistrikan kendaraan, termasuk baterai, alternator, dan sistem pengapian.',
    estimatedTime: 45,
    difficulty: 'beginner',
    content: {
      theory: {
        sections: [
          {
            title: 'Pengenalan Sistem Kelistrikan',
            content: 'Sistem kelistrikan otomotif adalah jaringan komponen yang menyediakan tenaga listrik untuk berbagai fungsi kendaraan...'
          },
          {
            title: 'Komponen Utama',
            content: 'Baterai, alternator, starter, dan sistem pengapian adalah komponen utama dalam sistem kelistrikan...'
          }
        ]
      },
      simulation: {
        type: 'circuit',
        parameters: { voltage: 12, current: 10 },
        scenarios: [
          {
            name: 'Normal Operation',
            description: 'Operasi normal sistem kelistrikan',
            initialValues: { voltage: 12.6, current: 8 }
          }
        ]
      },
      codeExamples: [
        {
          title: 'Monitoring Tegangan Baterai',
          description: 'Kode Arduino untuk monitoring tegangan baterai',
          language: 'arduino',
          code: `// Monitor tegangan baterai
#define VOLTAGE_PIN A0
void setup() {
  Serial.begin(9600);
}
void loop() {
  float voltage = analogRead(VOLTAGE_PIN) * (5.0/1023.0) * 3;
  Serial.println(voltage);
  delay(1000);
}`,
          explanation: 'Kode ini membaca tegangan dari pin analog dan mengkonversinya ke nilai tegangan sebenarnya.'
        }
      ],
      quiz: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Berapa tegangan normal baterai mobil?',
          options: ['6V', '12V', '24V', '48V'],
          correctAnswer: 1,
          explanation: 'Baterai mobil standar memiliki tegangan 12V.',
          points: 10
        }
      ]
    }
  },
  {
    id: 'cooling-system',
    title: 'Sistem Pendingin Mesin',
    category: 'cooling',
    description: 'Memahami cara kerja sistem pendingin mesin dan komponen-komponennya.',
    estimatedTime: 60,
    difficulty: 'intermediate',
    content: {
      theory: {
        sections: [
          {
            title: 'Fungsi Sistem Pendingin',
            content: 'Sistem pendingin berfungsi menjaga suhu mesin agar tetap dalam batas operasi yang optimal...'
          }
        ]
      },
      simulation: {
        type: 'sensor',
        parameters: { temperature: 85, flow: 50 },
        scenarios: [
          {
            name: 'Normal Cooling',
            description: 'Operasi normal sistem pendingin',
            initialValues: { temperature: 85, flow: 50 }
          }
        ]
      },
      codeExamples: [
        {
          title: 'Sensor Suhu Coolant',
          description: 'Monitoring suhu coolant dengan sensor',
          language: 'arduino',
          code: `// Sensor suhu coolant
#define TEMP_PIN A1
void setup() {
  Serial.begin(9600);
}
void loop() {
  float temp = analogRead(TEMP_PIN) * (5.0/1023.0) * 100;
  Serial.println(temp);
  delay(1000);
}`,
          explanation: 'Membaca suhu coolant menggunakan sensor suhu analog.'
        }
      ],
      quiz: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Suhu operasi normal mesin adalah?',
          options: ['60-70°C', '80-90°C', '100-110°C', '120-130°C'],
          correctAnswer: 1,
          explanation: 'Suhu operasi normal mesin adalah 80-90°C.',
          points: 10
        }
      ]
    }
  }
]

// Hook untuk learning module management
export function useLearning() {
  const {
    learning,
    setLearningModules,
    setCurrentModule,
    updateUserProgress,
    addQuizResult,
    setLearningLoading
  } = useAppStore()

  // Load learning modules
  const loadModules = useCallback(async () => {
    setLearningLoading(true)
    try {
      // In a real app, this would fetch from API
      setLearningModules(SAMPLE_MODULES)
      return SAMPLE_MODULES
    } catch (error) {
      console.error('Failed to load learning modules:', error)
      return []
    } finally {
      setLearningLoading(false)
    }
  }, [setLearningModules, setLearningLoading])

  // Get module by ID
  const getModule = useCallback((moduleId: string): LearningModule | undefined => {
    return learning.modules.find(module => module.id === moduleId)
  }, [learning.modules])

  // Get modules by category
  const getModulesByCategory = useCallback((category: string) => {
    return learning.modules.filter(module => module.category === category)
  }, [learning.modules])

  // Load user progress
  const loadUserProgress = useCallback(async (userSession: string) => {
    try {
      const progressData = await DatabaseService.getUserProgress(userSession)
      const progressMap: Record<string, UserProgress> = {}
      
      progressData.forEach((item: any) => {
        progressMap[item.moduleId] = {
          id: item.id,
          moduleId: item.moduleId,
          userSession: item.userSession,
          completionPercentage: item.completionPercentage,
          quizScores: JSON.parse(item.quizScores),
          lastAccessed: item.lastAccessed
        }
      })
      
      // Update store with progress data
      Object.entries(progressMap).forEach(([moduleId, progress]) => {
        updateUserProgress(moduleId, progress)
      })
      
      return progressMap
    } catch (error) {
      console.error('Failed to load user progress:', error)
      return {}
    }
  }, [updateUserProgress])

  // Save user progress
  const saveUserProgress = useCallback(async (
    moduleId: string,
    userSession: string,
    completionPercentage: number,
    quizScores: QuizResult[]
  ) => {
    try {
      const progress: UserProgress = {
        moduleId,
        userSession,
        completionPercentage,
        quizScores,
        lastAccessed: new Date()
      }

      await DatabaseService.saveUserProgress({
        moduleId,
        userSession,
        completionPercentage,
        quizScores: JSON.stringify(quizScores)
      })

      updateUserProgress(moduleId, progress)
      return progress
    } catch (error) {
      console.error('Failed to save user progress:', error)
      throw error
    }
  }, [updateUserProgress])

  // Submit quiz answer
  const submitQuizAnswer = useCallback(async (
    moduleId: string,
    questionId: string,
    userAnswer: string | number,
    correctAnswer: string | number,
    points: number,
    timeSpent: number
  ) => {
    const isCorrect = userAnswer === correctAnswer
    const earnedPoints = isCorrect ? points : 0

    const quizResult: QuizResult = {
      questionId,
      userAnswer,
      isCorrect,
      points: earnedPoints,
      timeSpent
    }

    addQuizResult(quizResult)

    // Update module progress
    const currentProgress = learning.progress[moduleId]
    const existingQuizScores = currentProgress?.quizScores || []
    const updatedQuizScores = [...existingQuizScores, quizResult]

    // Calculate completion percentage based on quiz completion
    const module = getModule(moduleId)
    if (module) {
      const totalQuestions = module.content.quiz.length
      const completedQuestions = updatedQuizScores.length
      const completionPercentage = Math.min(100, (completedQuestions / totalQuestions) * 100)

      await saveUserProgress(moduleId, 'current-user', completionPercentage, updatedQuizScores)
    }

    return quizResult
  }, [learning.progress, addQuizResult, getModule, saveUserProgress])

  // Calculate module statistics
  const getModuleStats = useCallback((moduleId: string) => {
    const progress = learning.progress[moduleId]
    const module = getModule(moduleId)

    if (!progress || !module) {
      return {
        completionPercentage: 0,
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        totalPoints: 0,
        earnedPoints: 0,
        averageTimePerQuestion: 0
      }
    }

    const totalQuestions = module.content.quiz.length
    const answeredQuestions = progress.quizScores.length
    const correctAnswers = progress.quizScores.filter(q => q.isCorrect).length
    const totalPoints = module.content.quiz.reduce((sum, q) => sum + q.points, 0)
    const earnedPoints = progress.quizScores.reduce((sum, q) => sum + q.points, 0)
    const totalTime = progress.quizScores.reduce((sum, q) => sum + q.timeSpent, 0)
    const averageTimePerQuestion = answeredQuestions > 0 ? totalTime / answeredQuestions : 0

    return {
      completionPercentage: progress.completionPercentage,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      totalPoints,
      earnedPoints,
      averageTimePerQuestion: Math.round(averageTimePerQuestion)
    }
  }, [learning.progress, getModule])

  // Get overall learning statistics
  const getOverallStats = useCallback(() => {
    const totalModules = learning.modules.length
    const startedModules = Object.keys(learning.progress).length
    const completedModules = Object.values(learning.progress).filter(p => p.completionPercentage >= 100).length
    
    const totalQuizResults = Object.values(learning.progress).reduce(
      (sum, progress) => sum + progress.quizScores.length, 0
    )
    const totalCorrectAnswers = Object.values(learning.progress).reduce(
      (sum, progress) => sum + progress.quizScores.filter(q => q.isCorrect).length, 0
    )

    const overallAccuracy = totalQuizResults > 0 ? (totalCorrectAnswers / totalQuizResults) * 100 : 0

    return {
      totalModules,
      startedModules,
      completedModules,
      overallAccuracy: Math.round(overallAccuracy),
      totalQuizResults,
      totalCorrectAnswers
    }
  }, [learning.modules, learning.progress])

  // Initialize learning system
  useEffect(() => {
    if (learning.modules.length === 0) {
      loadModules()
    }
  }, [learning.modules.length, loadModules])

  return {
    // State
    modules: learning.modules,
    currentModule: learning.currentModule,
    progress: learning.progress,
    quizResults: learning.quizResults,
    isLoading: learning.isLoading,
    categories: MODULE_CATEGORIES,

    // Actions
    loadModules,
    setCurrentModule,
    getModule,
    getModulesByCategory,
    loadUserProgress,
    saveUserProgress,
    submitQuizAnswer,
    getModuleStats,
    getOverallStats
  }
}