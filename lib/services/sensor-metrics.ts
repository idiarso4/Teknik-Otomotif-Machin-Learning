// Sensor metrics and analytics service

import { SensorData } from '@/lib/types/sensor'

export interface SensorMetrics {
    parameter: string
    current: number
    min: number
    max: number
    average: number
    median: number
    standardDeviation: number
    trend: 'increasing' | 'decreasing' | 'stable'
    trendStrength: number // 0-1
    anomalyScore: number // 0-1
    lastUpdated: Date
}

export interface SystemMetrics {
    totalDataPoints: number
    dataRate: number // points per second
    uptime: number // seconds
    anomaliesDetected: number
    lastAnomalyTime: Date | null
    overallHealth: 'excellent' | 'good' | 'warning' | 'critical'
    healthScore: number // 0-100
}

export interface PerformanceMetrics {
    processingLatency: number // ms
    memoryUsage: number // MB
    cpuUsage: number // percentage
    networkLatency: number // ms
    errorRate: number // percentage
    throughput: number // data points per second
}

export class SensorMetricsService {
    private dataHistory: SensorData[] = []
    private maxHistorySize: number = 10000
    private startTime: Date = new Date()
    private anomalyThreshold: number = 2.5 // standard deviations

    constructor(maxHistorySize?: number, anomalyThreshold?: number) {
        if (maxHistorySize) this.maxHistorySize = maxHistorySize
        if (anomalyThreshold) this.anomalyThreshold = anomalyThreshold
    }

    // Add new sensor data point
    addDataPoint(data: SensorData): void {
        this.dataHistory.push(data)

        // Maintain history size
        if (this.dataHistory.length > this.maxHistorySize) {
            this.dataHistory.shift()
        }
    }

    // Calculate metrics for a specific parameter
    calculateParameterMetrics(parameter: keyof SensorData): SensorMetrics | null {
        if (this.dataHistory.length === 0) return null

        const values = this.dataHistory
            .map(d => d[parameter])
            .filter(v => typeof v === 'number') as number[]

        if (values.length === 0) return null

        const current = values[values.length - 1]
        const min = Math.min(...values)
        const max = Math.max(...values)
        const average = values.reduce((sum, val) => sum + val, 0) / values.length

        // Calculate median
        const sortedValues = [...values].sort((a, b) => a - b)
        const median = sortedValues.length % 2 === 0
            ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
            : sortedValues[Math.floor(sortedValues.length / 2)]

        // Calculate standard deviation
        const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
        const standardDeviation = Math.sqrt(variance)

        // Calculate trend
        const { trend, trendStrength } = this.calculateTrend(values)

        // Calculate anomaly score
        const anomalyScore = this.calculateAnomalyScore(current, average, standardDeviation)

        return {
            parameter: parameter as string,
            current,
            min,
            max,
            average: Math.round(average * 100) / 100,
            median: Math.round(median * 100) / 100,
            standardDeviation: Math.round(standardDeviation * 100) / 100,
            trend,
            trendStrength: Math.round(trendStrength * 100) / 100,
            anomalyScore: Math.round(anomalyScore * 100) / 100,
            lastUpdated: new Date()
        }
    }

    // Calculate trend for a series of values
    private calculateTrend(values: number[]): { trend: 'increasing' | 'decreasing' | 'stable'; trendStrength: number } {
        if (values.length < 2) return { trend: 'stable', trendStrength: 0 }

        // Use linear regression to calculate trend
        const n = values.length
        const sumX = (n * (n - 1)) / 2 // Sum of indices 0,1,2...n-1
        const sumY = values.reduce((sum, val) => sum + val, 0)
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0)
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6 // Sum of squares of indices

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        const trendStrength = Math.min(1, Math.abs(slope) / (Math.max(...values) - Math.min(...values)) * values.length)

        let trend: 'increasing' | 'decreasing' | 'stable'
        if (Math.abs(slope) < 0.01) {
            trend = 'stable'
        } else if (slope > 0) {
            trend = 'increasing'
        } else {
            trend = 'decreasing'
        }

        return { trend, trendStrength }
    }

    // Calculate anomaly score using z-score
    private calculateAnomalyScore(value: number, mean: number, stdDev: number): number {
        if (stdDev === 0) return 0
        const zScore = Math.abs((value - mean) / stdDev)
        return Math.min(1, zScore / this.anomalyThreshold)
    }

    // Get metrics for all parameters
    getAllParameterMetrics(): Record<string, SensorMetrics> {
        const parameters: (keyof SensorData)[] = ['engineTemp', 'oilPressure', 'batteryVoltage', 'engineVibration', 'rpm']
        const metrics: Record<string, SensorMetrics> = {}

        parameters.forEach(param => {
            const paramMetrics = this.calculateParameterMetrics(param)
            if (paramMetrics) {
                metrics[param] = paramMetrics
            }
        })

        return metrics
    }

    // Get system-wide metrics
    getSystemMetrics(): SystemMetrics {
        const now = new Date()
        const uptime = (now.getTime() - this.startTime.getTime()) / 1000
        const dataRate = this.dataHistory.length / Math.max(uptime, 1)

        // Count anomalies
        const allMetrics = this.getAllParameterMetrics()
        const anomaliesDetected = Object.values(allMetrics)
            .filter(m => m.anomalyScore > 0.7).length

        // Find last anomaly time
        let lastAnomalyTime: Date | null = null
        if (anomaliesDetected > 0) {
            // Find the most recent data point with high anomaly score
            for (let i = this.dataHistory.length - 1; i >= 0; i--) {
                const data = this.dataHistory[i]
                const hasAnomaly = Object.keys(allMetrics).some(param => {
                    const metrics = allMetrics[param]
                    const value = data[param as keyof SensorData] as number
                    const anomalyScore = this.calculateAnomalyScore(value, metrics.average, metrics.standardDeviation)
                    return anomalyScore > 0.7
                })

                if (hasAnomaly) {
                    lastAnomalyTime = data.timestamp
                    break
                }
            }
        }

        // Calculate overall health
        const avgAnomalyScore = Object.values(allMetrics)
            .reduce((sum, m) => sum + m.anomalyScore, 0) / Math.max(Object.keys(allMetrics).length, 1)

        let overallHealth: 'excellent' | 'good' | 'warning' | 'critical'
        let healthScore: number

        if (avgAnomalyScore < 0.2) {
            overallHealth = 'excellent'
            healthScore = 95 - (avgAnomalyScore * 25)
        } else if (avgAnomalyScore < 0.5) {
            overallHealth = 'good'
            healthScore = 80 - (avgAnomalyScore * 30)
        } else if (avgAnomalyScore < 0.8) {
            overallHealth = 'warning'
            healthScore = 60 - (avgAnomalyScore * 25)
        } else {
            overallHealth = 'critical'
            healthScore = 30 - (avgAnomalyScore * 25)
        }

        return {
            totalDataPoints: this.dataHistory.length,
            dataRate: Math.round(dataRate * 100) / 100,
            uptime: Math.round(uptime),
            anomaliesDetected,
            lastAnomalyTime,
            overallHealth,
            healthScore: Math.max(0, Math.min(100, Math.round(healthScore)))
        }
    }

    // Get performance metrics
    getPerformanceMetrics(): PerformanceMetrics {
        // Simulate performance metrics (in a real app, these would be actual measurements)
        const baseLatency = 5 + Math.random() * 10
        const memoryUsage = 50 + Math.random() * 100
        const cpuUsage = 10 + Math.random() * 30
        const networkLatency = 20 + Math.random() * 50
        const errorRate = Math.random() * 2
        const throughput = this.dataHistory.length > 0 ?
            this.dataHistory.length / ((Date.now() - this.startTime.getTime()) / 1000) : 0

        return {
            processingLatency: Math.round(baseLatency * 100) / 100,
            memoryUsage: Math.round(memoryUsage * 100) / 100,
            cpuUsage: Math.round(cpuUsage * 100) / 100,
            networkLatency: Math.round(networkLatency * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100,
            throughput: Math.round(throughput * 100) / 100
        }
    }

    // Get data quality metrics
    getDataQualityMetrics(): {
        completeness: number
        consistency: number
        accuracy: number
        timeliness: number
        overall: number
    } {
        if (this.dataHistory.length === 0) {
            return { completeness: 0, consistency: 0, accuracy: 0, timeliness: 0, overall: 0 }
        }

        // Completeness: percentage of non-null values
        const totalFields = this.dataHistory.length * 5 // 5 sensor parameters
        const nonNullFields = this.dataHistory.reduce((count, data) => {
            return count +
                (data.engineTemp !== null ? 1 : 0) +
                (data.oilPressure !== null ? 1 : 0) +
                (data.batteryVoltage !== null ? 1 : 0) +
                (data.engineVibration !== null ? 1 : 0) +
                (data.rpm !== null ? 1 : 0)
        }, 0)
        const completeness = (nonNullFields / totalFields) * 100

        // Consistency: check for reasonable value transitions
        let consistentTransitions = 0
        let totalTransitions = 0
        for (let i = 1; i < this.dataHistory.length; i++) {
            const prev = this.dataHistory[i - 1]
            const curr = this.dataHistory[i]

            // Check if transitions are reasonable (not too abrupt)
            const tempChange = Math.abs(curr.engineTemp - prev.engineTemp)
            const pressureChange = Math.abs(curr.oilPressure - prev.oilPressure)
            const voltageChange = Math.abs(curr.batteryVoltage - prev.batteryVoltage)
            const vibrationChange = Math.abs(curr.engineVibration - prev.engineVibration)
            const rpmChange = Math.abs(curr.rpm - prev.rpm)

            if (tempChange < 10 && pressureChange < 2 && voltageChange < 1 &&
                vibrationChange < 20 && rpmChange < 500) {
                consistentTransitions++
            }
            totalTransitions++
        }
        const consistency = totalTransitions > 0 ? (consistentTransitions / totalTransitions) * 100 : 100

        // Accuracy: based on how many values are within expected ranges
        const allMetrics = this.getAllParameterMetrics()
        const accurateValues = Object.values(allMetrics)
            .reduce((sum, m) => sum + (1 - m.anomalyScore), 0)
        const accuracy = (accurateValues / Math.max(Object.keys(allMetrics).length, 1)) * 100

        // Timeliness: check if data timestamps are recent and sequential
        const now = Date.now()
        const recentData = this.dataHistory.filter(d =>
            (now - d.timestamp.getTime()) < 60000 // within last minute
        )
        const timeliness = (recentData.length / Math.min(this.dataHistory.length, 60)) * 100

        const overall = (completeness + consistency + accuracy + timeliness) / 4

        return {
            completeness: Math.round(completeness),
            consistency: Math.round(consistency),
            accuracy: Math.round(accuracy),
            timeliness: Math.round(timeliness),
            overall: Math.round(overall)
        }
    }

    // Reset metrics
    reset(): void {
        this.dataHistory = []
        this.startTime = new Date()
    }

    // Get data history
    getDataHistory(limit?: number): SensorData[] {
        if (limit) {
            return this.dataHistory.slice(-limit)
        }
        return [...this.dataHistory]
    }

    // Export metrics to JSON
    exportMetrics(): {
        parameterMetrics: Record<string, SensorMetrics>
        systemMetrics: SystemMetrics
        performanceMetrics: PerformanceMetrics
        dataQualityMetrics: ReturnType<SensorMetricsService['getDataQualityMetrics']>
        exportTime: Date
    } {
        return {
            parameterMetrics: this.getAllParameterMetrics(),
            systemMetrics: this.getSystemMetrics(),
            performanceMetrics: this.getPerformanceMetrics(),
            dataQualityMetrics: this.getDataQualityMetrics(),
            exportTime: new Date()
        }
    }
}

// Global metrics service instance
export const sensorMetricsService = new SensorMetricsService()

// Hook for using sensor metrics
export function useSensorMetrics() {
    return {
        service: sensorMetricsService,
        addDataPoint: sensorMetricsService.addDataPoint.bind(sensorMetricsService),
        calculateParameterMetrics: sensorMetricsService.calculateParameterMetrics.bind(sensorMetricsService),
        getAllParameterMetrics: sensorMetricsService.getAllParameterMetrics.bind(sensorMetricsService),
        getSystemMetrics: sensorMetricsService.getSystemMetrics.bind(sensorMetricsService),
        getPerformanceMetrics: sensorMetricsService.getPerformanceMetrics.bind(sensorMetricsService),
        getDataQualityMetrics: sensorMetricsService.getDataQualityMetrics.bind(sensorMetricsService),
        reset: sensorMetricsService.reset.bind(sensorMetricsService),
        getDataHistory: sensorMetricsService.getDataHistory.bind(sensorMetricsService),
        exportMetrics: sensorMetricsService.exportMetrics.bind(sensorMetricsService)
    }
}