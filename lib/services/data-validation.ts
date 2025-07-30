// Comprehensive data validation service for sensor data

import { SensorData, SensorRanges, DEFAULT_SENSOR_RANGES } from '@/lib/types/sensor'

export interface ValidationRule {
  name: string
  description: string
  validate: (data: SensorData, ranges: SensorRanges) => ValidationResult
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface ValidationResult {
  isValid: boolean
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  parameter?: string
  value?: number
  expectedRange?: { min: number; max: number }
}

export interface ValidationReport {
  isValid: boolean
  results: ValidationResult[]
  summary: {
    total: number
    passed: number
    warnings: number
    errors: number
    critical: number
  }
  timestamp: Date
}

// Predefined validation rules
export const VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'engine_temp_range',
    description: 'Engine temperature within valid range',
    severity: 'error',
    validate: (data, ranges) => ({
      isValid: data.engineTemp >= ranges.engineTemp.min && data.engineTemp <= ranges.engineTemp.max,
      message: data.engineTemp >= ranges.engineTemp.min && data.engineTemp <= ranges.engineTemp.max
        ? 'Engine temperature within valid range'
        : `Engine temperature ${data.engineTemp}°C outside valid range (${ranges.engineTemp.min}-${ranges.engineTemp.max}°C)`,
      severity: data.engineTemp >= ranges.engineTemp.critical.min && data.engineTemp <= ranges.engineTemp.critical.max
        ? 'critical' : 'error',
      parameter: 'engineTemp',
      value: data.engineTemp,
      expectedRange: { min: ranges.engineTemp.min, max: ranges.engineTemp.max }
    })
  },
  {
    name: 'oil_pressure_range',
    description: 'Oil pressure within valid range',
    severity: 'critical',
    validate: (data, ranges) => ({
      isValid: data.oilPressure >= ranges.oilPressure.min && data.oilPressure <= ranges.oilPressure.max,
      message: data.oilPressure >= ranges.oilPressure.min && data.oilPressure <= ranges.oilPressure.max
        ? 'Oil pressure within valid range'
        : `Oil pressure ${data.oilPressure} bar outside valid range (${ranges.oilPressure.min}-${ranges.oilPressure.max} bar)`,
      severity: data.oilPressure <= ranges.oilPressure.critical.max
        ? 'critical' : 'error',
      parameter: 'oilPressure',
      value: data.oilPressure,
      expectedRange: { min: ranges.oilPressure.min, max: ranges.oilPressure.max }
    })
  },
  {
    name: 'battery_voltage_range',
    description: 'Battery voltage within valid range',
    severity: 'warning',
    validate: (data, ranges) => ({
      isValid: data.batteryVoltage >= ranges.batteryVoltage.min && data.batteryVoltage <= ranges.batteryVoltage.max,
      message: data.batteryVoltage >= ranges.batteryVoltage.min && data.batteryVoltage <= ranges.batteryVoltage.max
        ? 'Battery voltage within valid range'
        : `Battery voltage ${data.batteryVoltage}V outside valid range (${ranges.batteryVoltage.min}-${ranges.batteryVoltage.max}V)`,
      severity: data.batteryVoltage <= ranges.batteryVoltage.critical.max
        ? 'critical' : 'warning',
      parameter: 'batteryVoltage',
      value: data.batteryVoltage,
      expectedRange: { min: ranges.batteryVoltage.min, max: ranges.batteryVoltage.max }
    })
  },
  {
    name: 'engine_vibration_range',
    description: 'Engine vibration within acceptable range',
    severity: 'warning',
    validate: (data, ranges) => ({
      isValid: data.engineVibration >= ranges.engineVibration.min && data.engineVibration <= ranges.engineVibration.max,
      message: data.engineVibration >= ranges.engineVibration.min && data.engineVibration <= ranges.engineVibration.max
        ? 'Engine vibration within acceptable range'
        : `Engine vibration ${data.engineVibration}Hz outside acceptable range (${ranges.engineVibration.min}-${ranges.engineVibration.max}Hz)`,
      severity: data.engineVibration >= ranges.engineVibration.critical.min
        ? 'critical' : 'warning',
      parameter: 'engineVibration',
      value: data.engineVibration,
      expectedRange: { min: ranges.engineVibration.min, max: ranges.engineVibration.max }
    })
  },
  {
    name: 'rpm_range',
    description: 'RPM within valid range',
    severity: 'info',
    validate: (data, ranges) => ({
      isValid: data.rpm >= ranges.rpm.min && data.rpm <= ranges.rpm.max,
      message: data.rpm >= ranges.rpm.min && data.rpm <= ranges.rpm.max
        ? 'RPM within valid range'
        : `RPM ${data.rpm} outside valid range (${ranges.rpm.min}-${ranges.rpm.max})`,
      severity: data.rpm >= ranges.rpm.critical.min
        ? 'warning' : 'info',
      parameter: 'rpm',
      value: data.rpm,
      expectedRange: { min: ranges.rpm.min, max: ranges.rpm.max }
    })
  },
  {
    name: 'data_consistency',
    description: 'Data consistency check',
    severity: 'warning',
    validate: (data) => {
      // Check for impossible combinations
      const issues: string[] = []
      
      // High temperature with normal oil pressure might indicate cooling issues
      if (data.engineTemp > 100 && data.oilPressure > 3) {
        issues.push('High engine temperature with normal oil pressure - check cooling system')
      }
      
      // Low battery voltage with high RPM
      if (data.batteryVoltage < 12 && data.rpm > 3000) {
        issues.push('Low battery voltage at high RPM - check alternator')
      }
      
      // High vibration with normal RPM
      if (data.engineVibration > 40 && data.rpm < 2000) {
        issues.push('High vibration at normal RPM - check engine mounts')
      }
      
      return {
        isValid: issues.length === 0,
        message: issues.length === 0 ? 'Data consistency check passed' : issues.join('; '),
        severity: 'warning' as const
      }
    }
  }
]

export class DataValidationService {
  private rules: ValidationRule[] = [...VALIDATION_RULES]
  private ranges: SensorRanges = DEFAULT_SENSOR_RANGES

  constructor(ranges?: SensorRanges) {
    if (ranges) {
      this.ranges = ranges
    }
  }

  // Validate single sensor data point
  validateData(data: SensorData): ValidationReport {
    const results: ValidationResult[] = []
    
    // Run all validation rules
    this.rules.forEach(rule => {
      try {
        const result = rule.validate(data, this.ranges)
        results.push(result)
      } catch (error) {
        console.error(`Validation rule ${rule.name} failed:`, error)
        results.push({
          isValid: false,
          message: `Validation rule ${rule.name} failed: ${error}`,
          severity: 'error'
        })
      }
    })

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.isValid).length,
      warnings: results.filter(r => !r.isValid && r.severity === 'warning').length,
      errors: results.filter(r => !r.isValid && r.severity === 'error').length,
      critical: results.filter(r => !r.isValid && r.severity === 'critical').length
    }

    return {
      isValid: summary.critical === 0 && summary.errors === 0,
      results,
      summary,
      timestamp: new Date()
    }
  }

  // Validate multiple data points
  validateDataBatch(dataPoints: SensorData[]): ValidationReport[] {
    return dataPoints.map(data => this.validateData(data))
  }

  // Add custom validation rule
  addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }

  // Remove validation rule
  removeRule(ruleName: string): boolean {
    const initialLength = this.rules.length
    this.rules = this.rules.filter(rule => rule.name !== ruleName)
    return this.rules.length < initialLength
  }

  // Get all validation rules
  getRules(): ValidationRule[] {
    return [...this.rules]
  }

  // Update sensor ranges
  updateRanges(ranges: SensorRanges): void {
    this.ranges = ranges
  }

  // Quick validation (returns only boolean)
  isDataValid(data: SensorData): boolean {
    return this.validateData(data).isValid
  }

  // Get validation summary for multiple data points
  getValidationSummary(dataPoints: SensorData[]): {
    totalPoints: number
    validPoints: number
    invalidPoints: number
    validationRate: number
    commonIssues: string[]
  } {
    const reports = this.validateDataBatch(dataPoints)
    const validPoints = reports.filter(r => r.isValid).length
    const invalidPoints = reports.length - validPoints
    
    // Find common issues
    const issueCount: Record<string, number> = {}
    reports.forEach(report => {
      report.results.forEach(result => {
        if (!result.isValid) {
          issueCount[result.message] = (issueCount[result.message] || 0) + 1
        }
      })
    })
    
    const commonIssues = Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue)

    return {
      totalPoints: dataPoints.length,
      validPoints,
      invalidPoints,
      validationRate: dataPoints.length > 0 ? (validPoints / dataPoints.length) * 100 : 0,
      commonIssues
    }
  }
}

// Global validation service instance
export const dataValidationService = new DataValidationService()

// Hook for using data validation
export function useDataValidation() {
  return {
    service: dataValidationService,
    validateData: dataValidationService.validateData.bind(dataValidationService),
    validateDataBatch: dataValidationService.validateDataBatch.bind(dataValidationService),
    isDataValid: dataValidationService.isDataValid.bind(dataValidationService),
    getValidationSummary: dataValidationService.getValidationSummary.bind(dataValidationService),
    addRule: dataValidationService.addRule.bind(dataValidationService),
    removeRule: dataValidationService.removeRule.bind(dataValidationService),
    getRules: dataValidationService.getRules.bind(dataValidationService),
    updateRanges: dataValidationService.updateRanges.bind(dataValidationService)
  }
}