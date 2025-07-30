// Types untuk sistem deteksi AI

export interface DetectionResult {
  id?: number
  parameter: string         // Parameter yang dianalisis
  confidence: number        // Tingkat kepercayaan (0-1)
  status: DetectionStatus   // Status deteksi
  recommendation: string    // Rekomendasi perbaikan
  timestamp: Date
}

export type DetectionStatus = 'normal' | 'warning' | 'critical'

export interface AIModel {
  type: 'RandomForest'
  parameters: {
    nEstimators: number     // Jumlah pohon keputusan
    maxDepth: number        // Kedalaman maksimum pohon
    threshold: number       // Threshold untuk klasifikasi
  }
}

export interface DetectionParameter {
  name: string
  displayName: string
  description: string
  weight: number            // Bobot parameter (0-1)
  enabled: boolean
}

export interface AIAnalysisResult {
  overallStatus: DetectionStatus
  confidence: number
  parameters: DetectionResult[]
  recommendations: string[]
  analysisTime: number      // Waktu analisis (ms)
}

// Default AI model configuration
export const DEFAULT_AI_MODEL: AIModel = {
  type: 'RandomForest',
  parameters: {
    nEstimators: 100,
    maxDepth: 10,
    threshold: 0.7
  }
}

// Parameter deteksi yang tersedia
export const DETECTION_PARAMETERS: DetectionParameter[] = [
  {
    name: 'engine_temp',
    displayName: 'Suhu Mesin',
    description: 'Analisis suhu mesin untuk deteksi overheating',
    weight: 0.25,
    enabled: true
  },
  {
    name: 'oil_pressure',
    displayName: 'Tekanan Oli',
    description: 'Monitoring tekanan oli untuk kesehatan mesin',
    weight: 0.3,
    enabled: true
  },
  {
    name: 'battery_voltage',
    displayName: 'Tegangan Baterai',
    description: 'Pemantauan sistem kelistrikan',
    weight: 0.2,
    enabled: true
  },
  {
    name: 'engine_vibration',
    displayName: 'Getaran Mesin',
    description: 'Deteksi ketidakseimbangan dan kerusakan mekanis',
    weight: 0.25,
    enabled: true
  }
]