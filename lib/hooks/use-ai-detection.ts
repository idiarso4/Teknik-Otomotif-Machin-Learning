// Custom hooks untuk AI detection system

import { useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store/app-store'
import { DetectionResult, DetectionStatus, AIAnalysisResult, DETECTION_PARAMETERS } from '@/lib/types/ai-detection'
import { SensorData, DEFAULT_SENSOR_RANGES } from '@/lib/types/sensor'
import { DatabaseService } from '@/lib/database'
import { aiDetectionService } from '@/lib/services/ai-fault-detection'

// Hook untuk AI detection management
export function useAIDetection() {
  const {
    ai,
    sensors,
    setAIResults,
    addAIResult,
    setCurrentAnalysis,
    updateAIModel,
    startAIAnalysis,
    stopAIAnalysis
  } = useAppStore()

  // Simulate Random Forest algorithm untuk fault detection
  const analyzeParameter = useCallback((
    parameterName: string,
    value: number,
    historicalData: number[]
  ): DetectionResult => {
    const ranges = DEFAULT_SENSOR_RANGES
    const parameter = DETECTION_PARAMETERS.find(p => p.name === parameterName)
    
    if (!parameter) {
      throw new Error(`Unknown parameter: ${parameterName}`)
    }

    let status: DetectionStatus = 'normal'
    let confidence = 0.5
    let recommendation = 'Parameter dalam batas normal.'

    // Get parameter range
    const paramRange = ranges[parameterName as keyof typeof ranges]
    
    // Determine status based on value ranges
    if (value >= paramRange.critical.min && value <= paramRange.critical.max) {
      status = 'critical'
      confidence = 0.85 + Math.random() * 0.1 // 85-95%
    } else if (value >= paramRange.warning.min && value <= paramRange.warning.max) {
      status = 'warning'
      confidence = 0.70 + Math.random() * 0.15 // 70-85%
    } else if (value >= paramRange.normal.min && value <= paramRange.normal.max) {
      status = 'normal'
      confidence = 0.80 + Math.random() * 0.15 // 80-95%
    } else {
      // Outside all ranges - critical
      status = 'critical'
      confidence = 0.90 + Math.random() * 0.05 // 90-95%
    }

    // Adjust confidence based on historical data consistency
    if (historicalData.length > 5) {
      const recentValues = historicalData.slice(-5)
      const variance = calculateVariance(recentValues)
      
      // Lower confidence if data is highly variable
      if (variance > (paramRange.max - paramRange.min) * 0.1) {
        confidence *= 0.9
      }
      
      // Adjust confidence based on trend
      const trend = calculateTrend(recentValues)
      if (Math.abs(trend) > 0.1) {
        confidence *= 0.95
      }
    }

    // Generate recommendations based on parameter and status
    recommendation = generateRecommendation(parameterName, status, value)

    return {
      parameter: parameterName,
      confidence: Math.round(confidence * 100) / 100,
      status,
      recommendation,
      timestamp: new Date()
    }
  }, [])

  // Calculate variance for confidence adjustment
  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }

  // Calculate trend (simple linear regression slope)
  const calculateTrend = (values: number[]): number => {
    const n = values.length
    const sumX = (n * (n - 1)) / 2 // Sum of indices 0,1,2...n-1
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6 // Sum of squares of indices
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }

  // Generate recommendations based on parameter analysis
  const generateRecommendation = (
    parameterName: string,
    status: DetectionStatus,
    value: number
  ): string => {
    const recommendations = {
      engine_temp: {
        normal: 'Suhu mesin dalam batas normal. Lanjutkan monitoring rutin.',
        warning: `Suhu mesin ${value}°C sedikit tinggi. Periksa sistem pendingin dan level coolant.`,
        critical: `BAHAYA: Suhu mesin ${value}°C sangat tinggi! Matikan mesin segera dan periksa sistem pendingin.`
      },
      oil_pressure: {
        normal: 'Tekanan oli dalam batas normal. Sistem pelumasan berfungsi baik.',
        warning: `Tekanan oli ${value} bar rendah. Periksa level oli dan kondisi filter oli.`,
        critical: `BAHAYA: Tekanan oli ${value} bar sangat rendah! Matikan mesin segera untuk mencegah kerusakan.`
      },
      battery_voltage: {
        normal: 'Tegangan baterai normal. Sistem kelistrikan berfungsi baik.',
        warning: `Tegangan baterai ${value}V rendah. Periksa alternator dan kondisi baterai.`,
        critical: `BAHAYA: Tegangan baterai ${value}V sangat rendah! Sistem kelistrikan bermasalah.`
      },
      engine_vibration: {
        normal: 'Getaran mesin dalam batas normal. Tidak ada masalah yang terdeteksi.',
        warning: `Getaran mesin ${value}Hz tinggi. Periksa engine mounting dan balancing.`,
        critical: `BAHAYA: Getaran mesin ${value}Hz sangat tinggi! Periksa komponen mesin segera.`
      }
    }

    return recommendations[parameterName as keyof typeof recommendations]?.[status] || 
           'Tidak dapat memberikan rekomendasi untuk parameter ini.'
  }

  // Perform comprehensive AI analysis using Random Forest service
  const performAnalysis = useCallback(async (currentData: SensorData, historicalData: SensorData[]) => {
    startAIAnalysis()

    try {
      const startTime = performance.now()
      
      // Use the AI detection service for analysis
      const results = await aiDetectionService.analyzeSensorData(currentData, historicalData)

      // Calculate overall analysis
      const criticalCount = results.filter(r => r.status === 'critical').length
      const warningCount = results.filter(r => r.status === 'warning').length
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length

      let overallStatus: DetectionStatus = 'normal'
      if (criticalCount > 0) {
        overallStatus = 'critical'
      } else if (warningCount > 0) {
        overallStatus = 'warning'
      }

      const analysisResult: AIAnalysisResult = {
        overallStatus,
        confidence: Math.round(avgConfidence * 100) / 100,
        parameters: results,
        recommendations: results.map(r => r.recommendation),
        analysisTime: performance.now() - startTime
      }

      // Update store
      setCurrentAnalysis(results)
      
      // Save results to database
      for (const result of results) {
        await DatabaseService.saveAIDetection({
          parameter: result.parameter,
          confidence: result.confidence,
          status: result.status,
          recommendation: result.recommendation
        })
        addAIResult(result)
      }

      return analysisResult
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw error
    } finally {
      stopAIAnalysis()
    }
  }, [startAIAnalysis, stopAIAnalysis, setCurrentAnalysis, addAIResult])

  // Load historical AI results
  const loadHistoricalResults = useCallback(async (limit: number = 50) => {
    try {
      const data = await DatabaseService.getAIDetections(limit)
      const results: DetectionResult[] = data.map((item: any) => ({
        id: item.id,
        parameter: item.parameter,
        confidence: item.confidence,
        status: item.status as DetectionStatus,
        recommendation: item.recommendation,
        timestamp: item.timestamp
      }))
      setAIResults(results)
      return results
    } catch (error) {
      console.error('Failed to load AI results:', error)
      return []
    }
  }, [setAIResults])

  // Auto-analysis when new sensor data arrives
  useEffect(() => {
    if (sensors.currentData && sensors.data.length > 10 && !ai.isAnalyzing) {
      // Perform analysis every 10 seconds
      const lastAnalysis = ai.lastAnalysisTime
      const now = new Date()
      
      if (!lastAnalysis || (now.getTime() - lastAnalysis.getTime()) > 10000) {
        performAnalysis(sensors.currentData, sensors.data.slice(0, 50))
      }
    }
  }, [sensors.currentData, sensors.data, ai.isAnalyzing, ai.lastAnalysisTime, performAnalysis])

  // Batch analysis for multiple data points
  const performBatchAnalysis = useCallback(async (dataPoints: SensorData[]) => {
    startAIAnalysis()
    try {
      const results = await aiDetectionService.batchAnalyze(dataPoints)
      return results
    } catch (error) {
      console.error('Batch analysis failed:', error)
      throw error
    } finally {
      stopAIAnalysis()
    }
  }, [startAIAnalysis, stopAIAnalysis])

  // Get fault statistics from current results
  const getFaultStatistics = useCallback(() => {
    return aiDetectionService.getFaultStatistics(ai.results)
  }, [ai.results])

  // Update AI model configuration
  const updateModelConfig = useCallback((newModel: Partial<typeof ai.model>) => {
    const updatedModel = { ...ai.model, ...newModel }
    aiDetectionService.updateModel(updatedModel)
    updateAIModel(updatedModel)
  }, [ai.model, updateAIModel])

  // Get current AI model from service
  const getCurrentModel = useCallback(() => {
    return aiDetectionService.getModel()
  }, [])

  return {
    // State
    results: ai.results,
    currentAnalysis: ai.currentAnalysis,
    model: ai.model,
    isAnalyzing: ai.isAnalyzing,
    lastAnalysisTime: ai.lastAnalysisTime,
    
    // Actions
    performAnalysis,
    performBatchAnalysis,
    loadHistoricalResults,
    updateModel: updateAIModel,
    updateModelConfig,
    getCurrentModel,
    getFaultStatistics,
    analyzeParameter,
    
    // Service instance for advanced usage
    aiService: aiDetectionService
  }
}