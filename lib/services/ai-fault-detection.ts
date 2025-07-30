// AI Fault Detection Service - Random Forest Algorithm Simulation

import { SensorData, DEFAULT_SENSOR_RANGES } from '@/lib/types/sensor'
import { DetectionResult, DetectionStatus, AIModel, DETECTION_PARAMETERS } from '@/lib/types/ai-detection'

// Decision Tree Node untuk Random Forest
interface DecisionTreeNode {
  feature?: string
  threshold?: number
  left?: DecisionTreeNode
  right?: DecisionTreeNode
  prediction?: DetectionStatus
  confidence?: number
}

// Random Forest Classifier
export class RandomForestClassifier {
  private trees: DecisionTreeNode[] = []
  private model: AIModel

  constructor(model: AIModel) {
    this.model = model
    this.initializeTrees()
  }

  // Initialize decision trees dengan parameter yang berbeda
  private initializeTrees(): void {
    this.trees = []

    for (let i = 0; i < this.model.parameters.nEstimators; i++) {
      const tree = this.createDecisionTree(i)
      this.trees.push(tree)
    }
  }

  // Create single decision tree dengan variasi random
  private createDecisionTree(treeIndex: number): DecisionTreeNode {
    const seed = treeIndex * 42 // Simple seeding untuk konsistensi

    // Tree untuk engine temperature
    if (treeIndex % 4 === 0) {
      return {
        feature: 'engine_temp',
        threshold: 95 + (seed % 10),
        left: {
          threshold: 85 + (seed % 5),
          left: { prediction: 'normal', confidence: 0.9 },
          right: { prediction: 'warning', confidence: 0.8 }
        },
        right: { prediction: 'critical', confidence: 0.95 }
      }
    }

    // Tree untuk oil pressure
    if (treeIndex % 4 === 1) {
      return {
        feature: 'oil_pressure',
        threshold: 1.5 - (seed % 3) * 0.1,
        left: { prediction: 'critical', confidence: 0.9 },
        right: {
          threshold: 3.0 + (seed % 2) * 0.2,
          left: { prediction: 'normal', confidence: 0.85 },
          right: { prediction: 'warning', confidence: 0.75 }
        }
      }
    }

    // Tree untuk battery voltage
    if (treeIndex % 4 === 2) {
      return {
        feature: 'battery_voltage',
        threshold: 11.5 + (seed % 2) * 0.2,
        left: { prediction: 'critical', confidence: 0.88 },
        right: {
          threshold: 13.8 + (seed % 3) * 0.1,
          left: { prediction: 'normal', confidence: 0.82 },
          right: { prediction: 'warning', confidence: 0.78 }
        }
      }
    }

    // Tree untuk engine vibration
    return {
      feature: 'engine_vibration',
      threshold: 15 + (seed % 5),
      left: { prediction: 'normal', confidence: 0.85 },
      right: {
        threshold: 25 + (seed % 3),
        left: { prediction: 'warning', confidence: 0.8 },
        right: { prediction: 'critical', confidence: 0.92 }
      }
    }
  }

  // Predict menggunakan single tree
  private predictWithTree(tree: DecisionTreeNode, data: SensorData): { status: DetectionStatus, confidence: number } {
    if (tree.prediction) {
      return { status: tree.prediction, confidence: tree.confidence || 0.5 }
    }

    if (!tree.feature || tree.threshold === undefined) {
      return { status: 'normal', confidence: 0.5 }
    }

    const featureValue = this.getFeatureValue(data, tree.feature)

    if (featureValue <= tree.threshold) {
      return tree.left ? this.predictWithTree(tree.left, data) : { status: 'normal', confidence: 0.5 }
    } else {
      return tree.right ? this.predictWithTree(tree.right, data) : { status: 'normal', confidence: 0.5 }
    }
  }

  // Get feature value dari sensor data
  private getFeatureValue(data: SensorData, feature: string): number {
    switch (feature) {
      case 'engine_temp': return data.engineTemp
      case 'oil_pressure': return data.oilPressure
      case 'battery_voltage': return data.batteryVoltage
      case 'engine_vibration': return data.engineVibration
      default: return 0
    }
  }

  // Predict menggunakan ensemble dari semua trees
  predict(data: SensorData): Map<string, { status: DetectionStatus, confidence: number }> {
    const predictions = new Map<string, { status: DetectionStatus, confidence: number }>()

    // Get predictions untuk setiap parameter
    for (const param of DETECTION_PARAMETERS) {
      if (!param.enabled) continue

      const votes = { normal: 0, warning: 0, critical: 0 }
      const confidences: number[] = []

      // Collect votes dari semua trees
      for (const tree of this.trees) {
        const prediction = this.predictWithTree(tree, data)
        votes[prediction.status]++
        confidences.push(prediction.confidence)
      }

      // Determine final prediction berdasarkan majority vote
      let finalStatus: DetectionStatus = 'normal'
      let maxVotes = votes.normal

      if (votes.warning > maxVotes) {
        finalStatus = 'warning'
        maxVotes = votes.warning
      }

      if (votes.critical > maxVotes) {
        finalStatus = 'critical'
        maxVotes = votes.critical
      }

      // Calculate confidence berdasarkan vote ratio dan average confidence
      const voteRatio = maxVotes / this.trees.length
      const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      const finalConfidence = (voteRatio * 0.6 + avgConfidence * 0.4) * param.weight

      predictions.set(param.name, {
        status: finalStatus,
        confidence: Math.min(0.99, Math.max(0.01, finalConfidence))
      })
    }

    return predictions
  }

  // Update model parameters
  updateModel(newModel: AIModel): void {
    this.model = newModel
    this.initializeTrees()
  }
}

// AI Fault Detection Service
export class AIFaultDetectionService {
  private classifier: RandomForestClassifier
  private historicalData: SensorData[] = []

  constructor(model: AIModel = {
    type: 'RandomForest',
    parameters: {
      nEstimators: 100,
      maxDepth: 10,
      threshold: 0.7
    }
  }) {
    this.classifier = new RandomForestClassifier(model)
  }

  // Analyze current sensor data
  async analyzeSensorData(
    currentData: SensorData,
    historicalData: SensorData[] = []
  ): Promise<DetectionResult[]> {
    this.historicalData = historicalData

    // Get predictions dari Random Forest
    const predictions = this.classifier.predict(currentData)
    const results: DetectionResult[] = []

    // Convert predictions ke DetectionResult
    for (const [paramName, prediction] of predictions) {
      const parameter = DETECTION_PARAMETERS.find(p => p.name === paramName)
      if (!parameter) continue

      // Adjust confidence berdasarkan historical data consistency
      const adjustedConfidence = this.adjustConfidenceWithHistory(
        paramName,
        prediction.confidence,
        currentData
      )

      // Generate recommendation
      const recommendation = this.generateRecommendation(
        paramName,
        prediction.status,
        this.getParameterValue(currentData, paramName)
      )

      results.push({
        parameter: paramName,
        confidence: Math.round(adjustedConfidence * 100) / 100,
        status: prediction.status,
        recommendation,
        timestamp: new Date()
      })
    }

    return results
  }

  // Adjust confidence berdasarkan historical data
  private adjustConfidenceWithHistory(
    paramName: string,
    baseConfidence: number,
    currentData: SensorData
  ): number {
    if (this.historicalData.length < 5) {
      return baseConfidence
    }

    const recentValues = this.historicalData
      .slice(-10)
      .map(data => this.getParameterValue(data, paramName))

    const currentValue = this.getParameterValue(currentData, paramName)

    // Calculate variance untuk stability check
    const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
    const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length

    // Calculate trend
    const trend = this.calculateTrend(recentValues)

    let adjustmentFactor = 1.0

    // Reduce confidence jika data sangat variable
    const ranges = DEFAULT_SENSOR_RANGES[paramName as keyof typeof DEFAULT_SENSOR_RANGES]
    if (ranges && variance > Math.pow((ranges.max - ranges.min) * 0.1, 2)) {
      adjustmentFactor *= 0.9
    }

    // Adjust berdasarkan trend consistency
    if (Math.abs(trend) > 0.1) {
      adjustmentFactor *= 0.95
    }

    // Boost confidence jika current value sangat jauh dari normal
    if (ranges) {
      const normalRange = ranges.normal
      if (currentValue < normalRange.min || currentValue > normalRange.max) {
        adjustmentFactor *= 1.1
      }
    }

    return Math.min(0.99, Math.max(0.01, baseConfidence * adjustmentFactor))
  }

  // Calculate trend menggunakan simple linear regression
  private calculateTrend(values: number[]): number {
    const n = values.length
    if (n < 2) return 0

    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

    const denominator = n * sumXX - sumX * sumX
    if (denominator === 0) return 0

    return (n * sumXY - sumX * sumY) / denominator
  }

  // Get parameter value dari sensor data
  private getParameterValue(data: SensorData, paramName: string): number {
    switch (paramName) {
      case 'engine_temp': return data.engineTemp
      case 'oil_pressure': return data.oilPressure
      case 'battery_voltage': return data.batteryVoltage
      case 'engine_vibration': return data.engineVibration
      default: return 0
    }
  }

  // Generate repair recommendations
  private generateRecommendation(
    paramName: string,
    status: DetectionStatus,
    value: number
  ): string {
    const recommendations = {
      engine_temp: {
        normal: 'Suhu mesin dalam batas normal. Lanjutkan monitoring rutin.',
        warning: `Suhu mesin ${value.toFixed(1)}°C sedikit tinggi. Periksa sistem pendingin, level coolant, dan kondisi radiator.`,
        critical: `BAHAYA: Suhu mesin ${value.toFixed(1)}°C sangat tinggi! Matikan mesin segera dan periksa sistem pendingin, thermostat, dan water pump.`
      },
      oil_pressure: {
        normal: 'Tekanan oli dalam batas normal. Sistem pelumasan berfungsi baik.',
        warning: `Tekanan oli ${value.toFixed(1)} bar rendah. Periksa level oli, kondisi filter oli, dan kemungkinan kebocoran.`,
        critical: `BAHAYA: Tekanan oli ${value.toFixed(1)} bar sangat rendah! Matikan mesin segera untuk mencegah kerusakan bearing dan komponen internal.`
      },
      battery_voltage: {
        normal: 'Tegangan baterai normal. Sistem kelistrikan berfungsi baik.',
        warning: `Tegangan baterai ${value.toFixed(1)}V rendah. Periksa alternator, kondisi baterai, dan koneksi kabel.`,
        critical: `BAHAYA: Tegangan baterai ${value.toFixed(1)}V sangat rendah! Sistem kelistrikan bermasalah, periksa alternator dan baterai segera.`
      },
      engine_vibration: {
        normal: 'Getaran mesin dalam batas normal. Tidak ada masalah yang terdeteksi.',
        warning: `Getaran mesin ${value.toFixed(1)}Hz tinggi. Periksa engine mounting, balancing, dan kondisi komponen rotating.`,
        critical: `BAHAYA: Getaran mesin ${value.toFixed(1)}Hz sangat tinggi! Periksa komponen mesin, crankshaft, dan sistem mounting segera.`
      }
    }

    return recommendations[paramName as keyof typeof recommendations]?.[status] ||
      'Tidak dapat memberikan rekomendasi untuk parameter ini.'
  }

  // Update AI model
  updateModel(newModel: AIModel): void {
    this.classifier.updateModel(newModel)
  }

  // Get current model
  getModel(): AIModel {
    return this.classifier['model']
  }

  // Batch analysis untuk multiple data points
  async batchAnalyze(dataPoints: SensorData[]): Promise<DetectionResult[][]> {
    const results: DetectionResult[][] = []

    for (let i = 0; i < dataPoints.length; i++) {
      const historicalData = dataPoints.slice(0, i)
      const currentData = dataPoints[i]

      const analysis = await this.analyzeSensorData(currentData, historicalData)
      results.push(analysis)
    }

    return results
  }

  // Get fault statistics
  getFaultStatistics(results: DetectionResult[]): {
    totalFaults: number
    criticalFaults: number
    warningFaults: number
    normalReadings: number
    averageConfidence: number
    faultsByParameter: Record<string, { critical: number, warning: number, normal: number }>
  } {
    const stats = {
      totalFaults: 0,
      criticalFaults: 0,
      warningFaults: 0,
      normalReadings: 0,
      averageConfidence: 0,
      faultsByParameter: {} as Record<string, { critical: number, warning: number, normal: number }>
    }

    if (results.length === 0) return stats

    let totalConfidence = 0

    for (const result of results) {
      totalConfidence += result.confidence

      if (result.status === 'critical') {
        stats.criticalFaults++
        stats.totalFaults++
      } else if (result.status === 'warning') {
        stats.warningFaults++
        stats.totalFaults++
      } else {
        stats.normalReadings++
      }

      // Track by parameter
      if (!stats.faultsByParameter[result.parameter]) {
        stats.faultsByParameter[result.parameter] = { critical: 0, warning: 0, normal: 0 }
      }
      stats.faultsByParameter[result.parameter][result.status]++
    }

    stats.averageConfidence = totalConfidence / results.length

    return stats
  }
}

// Export singleton instance
export const aiDetectionService = new AIFaultDetectionService()