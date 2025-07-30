// Custom hooks untuk sensor data management

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store/app-store'
import { SensorData } from '@/lib/types/sensor'
import { DatabaseService } from '@/lib/database'
import { SensorSimulationEngine, SIMULATION_SCENARIOS } from '@/lib/services/sensor-simulation'
import { dataStreamingService } from '@/lib/services/data-streaming'
import { dataValidationService } from '@/lib/services/data-validation'
import { sensorMetricsService } from '@/lib/services/sensor-metrics'

// Hook untuk sensor data management
export function useSensorData() {
  const {
    sensors,
    setSensorData,
    addSensorData,
    setCurrentSensorData,
    updateSensorConfig,
    startSensorSimulation,
    stopSensorSimulation,
    clearSensorData
  } = useAppStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const simulationEngineRef = useRef<SensorSimulationEngine | null>(null)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize simulation engine
  const initializeSimulationEngine = useCallback(() => {
    if (!simulationEngineRef.current) {
      simulationEngineRef.current = new SensorSimulationEngine(sensors.ranges)
    }
    return simulationEngineRef.current
  }, [sensors.ranges])

  // Generate realistic sensor data using advanced simulation engine
  const generateSensorData = useCallback((): SensorData => {
    const engine = initializeSimulationEngine()
    return engine.generateData(sensors.config)
  }, [sensors.config, initializeSimulationEngine])

  // Start simulation scenario
  const startScenario = useCallback((scenarioKey: string) => {
    const engine = initializeSimulationEngine()
    try {
      engine.startScenario(scenarioKey)
      return true
    } catch (error) {
      console.error('Failed to start scenario:', error)
      return false
    }
  }, [initializeSimulationEngine])

  // Stop current scenario
  const stopScenario = useCallback(() => {
    const engine = simulationEngineRef.current
    if (engine) {
      engine.stopScenario()
    }
  }, [])

  // Get current scenario info
  const getCurrentScenario = useCallback(() => {
    const engine = simulationEngineRef.current
    return engine ? engine.getCurrentScenario() : null
  }, [])

  // Get active faults
  const getActiveFaults = useCallback(() => {
    const engine = simulationEngineRef.current
    return engine ? engine.getActiveFaults() : []
  }, [])

  // Validate sensor data against ranges
  const validateSensorData = useCallback((data: SensorData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    const { ranges } = sensors

    // Check each parameter against its valid range
    if (data.engineTemp < ranges.engineTemp.min || data.engineTemp > ranges.engineTemp.max) {
      errors.push(`Engine temperature ${data.engineTemp}°C is outside valid range (${ranges.engineTemp.min}-${ranges.engineTemp.max}°C)`)
    }

    if (data.oilPressure < ranges.oilPressure.min || data.oilPressure > ranges.oilPressure.max) {
      errors.push(`Oil pressure ${data.oilPressure} bar is outside valid range (${ranges.oilPressure.min}-${ranges.oilPressure.max} bar)`)
    }

    if (data.batteryVoltage < ranges.batteryVoltage.min || data.batteryVoltage > ranges.batteryVoltage.max) {
      errors.push(`Battery voltage ${data.batteryVoltage}V is outside valid range (${ranges.batteryVoltage.min}-${ranges.batteryVoltage.max}V)`)
    }

    if (data.engineVibration < ranges.engineVibration.min || data.engineVibration > ranges.engineVibration.max) {
      errors.push(`Engine vibration ${data.engineVibration}Hz is outside valid range (${ranges.engineVibration.min}-${ranges.engineVibration.max}Hz)`)
    }

    if (data.rpm < ranges.rpm.min || data.rpm > ranges.rpm.max) {
      errors.push(`RPM ${data.rpm} is outside valid range (${ranges.rpm.min}-${ranges.rpm.max})`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [sensors.ranges])

  // Perform automatic data cleanup
  const performDataCleanup = useCallback(async () => {
    try {
      // Clean up old sensor data (keep last 30 days)
      await DatabaseService.cleanupOldSensorData(30)
      
      // Clean up old AI detection results (keep last 30 days)
      await DatabaseService.cleanupOldAIDetections(30)
      
      console.log('Data cleanup completed successfully')
    } catch (error) {
      console.error('Data cleanup failed:', error)
      throw error
    }
  }, [])

  // Start sensor simulation
  const startSimulation = useCallback(async () => {
    if (intervalRef.current) return

    startSensorSimulation()

    // Start data streaming service
    dataStreamingService.startStreaming()

    // Update validation service ranges
    dataValidationService.updateRanges(sensors.ranges)

    // Start data generation interval
    intervalRef.current = setInterval(async () => {
      const newData = generateSensorData()

      // Comprehensive data validation using validation service
      const validationReport = dataValidationService.validateData(newData)
      if (!validationReport.isValid) {
        console.warn('Data validation failed:', validationReport.results.filter(r => !r.isValid))
      }

      // Push to streaming service
      dataStreamingService.pushData(newData)

      // Add to metrics service for analytics
      sensorMetricsService.addDataPoint(newData)

      // Update store
      addSensorData(newData)
      setCurrentSensorData(newData)

      // Save to database if auto-save is enabled
      if (sensors.config.autoSave) {
        try {
          await DatabaseService.saveSensorData({
            engineTemp: newData.engineTemp,
            oilPressure: newData.oilPressure,
            batteryVoltage: newData.batteryVoltage,
            engineVibration: newData.engineVibration,
            rpm: newData.rpm
          })
        } catch (error) {
          console.error('Failed to save sensor data:', error)
        }
      }
    }, sensors.config.samplingRate)

    // Start automatic data cleanup (every 5 minutes)
    cleanupIntervalRef.current = setInterval(async () => {
      try {
        await performDataCleanup()
      } catch (error) {
        console.error('Failed to perform data cleanup:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes
  }, [sensors.config, sensors.ranges, generateSensorData, addSensorData, setCurrentSensorData, startSensorSimulation, performDataCleanup])

  // Stop sensor simulation
  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current)
      cleanupIntervalRef.current = null
    }
    
    // Stop data streaming service
    dataStreamingService.stopStreaming()
    
    stopSensorSimulation()
  }, [stopSensorSimulation])

  // Load historical data
  const loadHistoricalData = useCallback(async (limit: number = 100) => {
    try {
      const data = await DatabaseService.getSensorData(limit)
      const sensorData: SensorData[] = data.map((item: any) => ({
        id: item.id,
        engineTemp: item.engineTemp,
        oilPressure: item.oilPressure,
        batteryVoltage: item.batteryVoltage,
        engineVibration: item.engineVibration,
        rpm: item.rpm,
        timestamp: item.timestamp
      }))
      setSensorData(sensorData)
      return sensorData
    } catch (error) {
      console.error('Failed to load historical data:', error)
      return []
    }
  }, [setSensorData])

  // Load data by time range
  const loadDataByTimeRange = useCallback(async (startTime: Date, endTime: Date) => {
    try {
      const data = await DatabaseService.getSensorDataByTimeRange(startTime, endTime)
      const sensorData: SensorData[] = data.map((item: any) => ({
        id: item.id,
        engineTemp: item.engineTemp,
        oilPressure: item.oilPressure,
        batteryVoltage: item.batteryVoltage,
        engineVibration: item.engineVibration,
        rpm: item.rpm,
        timestamp: item.timestamp
      }))
      return sensorData
    } catch (error) {
      console.error('Failed to load data by time range:', error)
      return []
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    // State
    sensorData: sensors.data,
    currentData: sensors.currentData,
    config: sensors.config,
    isRunning: sensors.isRunning,
    ranges: sensors.ranges,

    // Actions
    startSimulation,
    stopSimulation,
    updateConfig: updateSensorConfig,
    clearData: clearSensorData,
    loadHistoricalData,
    loadDataByTimeRange,
    generateSensorData,

    // Advanced simulation features
    startScenario,
    stopScenario,
    getCurrentScenario,
    getActiveFaults,
    validateSensorData,

    // Available scenarios
    scenarios: SIMULATION_SCENARIOS
  }
}

// Hook untuk sensor configuration
export function useSensorConfig() {
  const { sensors, updateSensorConfig } = useAppStore()

  const updateSamplingRate = useCallback((rate: number) => {
    updateSensorConfig({ samplingRate: Math.max(100, Math.min(10000, rate)) })
  }, [updateSensorConfig])

  const updateNoiseLevel = useCallback((level: number) => {
    updateSensorConfig({ noiseLevel: Math.max(0, Math.min(1, level)) })
  }, [updateSensorConfig])

  const toggleFaultInjection = useCallback(() => {
    updateSensorConfig({ faultInjection: !sensors.config.faultInjection })
  }, [sensors.config.faultInjection, updateSensorConfig])

  const toggleAutoSave = useCallback(() => {
    updateSensorConfig({ autoSave: !sensors.config.autoSave })
  }, [sensors.config.autoSave, updateSensorConfig])

  return {
    config: sensors.config,
    ranges: sensors.ranges,
    updateSamplingRate,
    updateNoiseLevel,
    toggleFaultInjection,
    toggleAutoSave,
    updateConfig: updateSensorConfig
  }
}