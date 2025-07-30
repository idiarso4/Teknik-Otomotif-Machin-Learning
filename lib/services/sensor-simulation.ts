// Advanced sensor simulation engine untuk aplikasi otomotif

import { SensorData, SensorConfig, SensorRanges, DEFAULT_SENSOR_RANGES } from '@/lib/types/sensor'

export interface SimulationScenario {
  name: string
  description: string
  duration: number // dalam detik
  parameters: {
    engineTemp: { base: number; variation: number; trend: number }
    oilPressure: { base: number; variation: number; trend: number }
    batteryVoltage: { base: number; variation: number; trend: number }
    engineVibration: { base: number; variation: number; trend: number }
    rpm: { base: number; variation: number; trend: number }
  }
  faults?: FaultEvent[]
}

export interface FaultEvent {
  startTime: number // detik dari mulai simulasi
  duration: number  // durasi fault dalam detik
  type: 'overheating' | 'low_oil_pressure' | 'battery_drain' | 'high_vibration' | 'engine_stall'
  severity: 'warning' | 'critical'
  parameters: Record<string, number>
}

// Predefined simulation scenarios
export const SIMULATION_SCENARIOS: Record<string, SimulationScenario> = {
  normal_operation: {
    name: 'Operasi Normal',
    description: 'Kondisi operasi normal kendaraan',
    duration: 300, // 5 menit
    parameters: {
      engineTemp: { base: 85, variation: 5, trend: 0 },
      oilPressure: { base: 4.2, variation: 0.3, trend: 0 },
      batteryVoltage: { base: 12.6, variation: 0.2, trend: 0 },
      engineVibration: { base: 15, variation: 5, trend: 0 },
      rpm: { base: 2000, variation: 200, trend: 0 }
    }
  },
  
  cold_start: {
    name: 'Cold Start',
    description: 'Kondisi start mesin dingin',
    duration: 180, // 3 menit
    parameters: {
      engineTemp: { base: 20, variation: 2, trend: 0.3 }, // Warming up
      oilPressure: { base: 5.5, variation: 0.5, trend: -0.01 }, // High initially, then normal
      batteryVoltage: { base: 12.2, variation: 0.3, trend: 0.002 }, // Recovering after start
      engineVibration: { base: 25, variation: 8, trend: -0.05 }, // High initially, then smooth
      rpm: { base: 1200, variation: 100, trend: -0.5 } // High idle, then normal
    }
  },
  
  highway_driving: {
    name: 'Berkendara di Jalan Tol',
    description: 'Kondisi berkendara kecepatan tinggi',
    duration: 600, // 10 menit
    parameters: {
      engineTemp: { base: 90, variation: 3, trend: 0.01 },
      oilPressure: { base: 4.0, variation: 0.2, trend: 0 },
      batteryVoltage: { base: 13.8, variation: 0.1, trend: 0 }, // Charging
      engineVibration: { base: 12, variation: 3, trend: 0 },
      rpm: { base: 3500, variation: 300, trend: 0 }
    }
  },
  
  city_traffic: {
    name: 'Macet Kota',
    description: 'Kondisi macet dengan stop-and-go',
    duration: 900, // 15 menit
    parameters: {
      engineTemp: { base: 88, variation: 8, trend: 0.02 }, // Heating up in traffic
      oilPressure: { base: 4.1, variation: 0.4, trend: 0 },
      batteryVoltage: { base: 12.4, variation: 0.3, trend: -0.001 }, // Slight drain
      engineVibration: { base: 18, variation: 10, trend: 0 }, // Variable due to stop-go
      rpm: { base: 800, variation: 1500, trend: 0 } // Idle to acceleration
    },
    faults: [
      {
        startTime: 600, // After 10 minutes in traffic
        duration: 120,
        type: 'overheating',
        severity: 'warning',
        parameters: { engineTemp: 105 }
      }
    ]
  },
  
  engine_problems: {
    name: 'Masalah Mesin',
    description: 'Simulasi berbagai masalah mesin',
    duration: 300,
    parameters: {
      engineTemp: { base: 85, variation: 5, trend: 0 },
      oilPressure: { base: 4.2, variation: 0.3, trend: 0 },
      batteryVoltage: { base: 12.6, variation: 0.2, trend: 0 },
      engineVibration: { base: 15, variation: 5, trend: 0 },
      rpm: { base: 2000, variation: 200, trend: 0 }
    },
    faults: [
      {
        startTime: 60,
        duration: 30,
        type: 'low_oil_pressure',
        severity: 'critical',
        parameters: { oilPressure: 1.2 }
      },
      {
        startTime: 150,
        duration: 45,
        type: 'high_vibration',
        severity: 'warning',
        parameters: { engineVibration: 45 }
      },
      {
        startTime: 240,
        duration: 60,
        type: 'battery_drain',
        severity: 'warning',
        parameters: { batteryVoltage: 11.8 }
      }
    ]
  }
}

export class SensorSimulationEngine {
  private startTime: number = 0
  private currentScenario: SimulationScenario | null = null
  private activeFaults: FaultEvent[] = []
  private ranges: SensorRanges = DEFAULT_SENSOR_RANGES

  constructor(ranges?: SensorRanges) {
    if (ranges) {
      this.ranges = ranges
    }
  }

  // Start simulation with scenario
  startScenario(scenarioKey: string) {
    const scenario = SIMULATION_SCENARIOS[scenarioKey]
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioKey}`)
    }

    this.currentScenario = scenario
    this.startTime = Date.now()
    this.activeFaults = []
  }

  // Stop current scenario
  stopScenario() {
    this.currentScenario = null
    this.activeFaults = []
  }

  // Generate sensor data based on current scenario and time
  generateData(config: SensorConfig): SensorData {
    const now = Date.now()
    const elapsedSeconds = (now - this.startTime) / 1000

    if (!this.currentScenario) {
      // Fallback to basic generation if no scenario
      return this.generateBasicData(config)
    }

    // Check for active faults
    this.updateActiveFaults(elapsedSeconds)

    // Generate base values from scenario
    const scenario = this.currentScenario
    const params = scenario.parameters

    let engineTemp = this.calculateParameterValue(
      params.engineTemp, elapsedSeconds, config.noiseLevel
    )
    let oilPressure = this.calculateParameterValue(
      params.oilPressure, elapsedSeconds, config.noiseLevel
    )
    let batteryVoltage = this.calculateParameterValue(
      params.batteryVoltage, elapsedSeconds, config.noiseLevel
    )
    let engineVibration = this.calculateParameterValue(
      params.engineVibration, elapsedSeconds, config.noiseLevel
    )
    let rpm = this.calculateParameterValue(
      params.rpm, elapsedSeconds, config.noiseLevel
    )

    // Apply active faults
    this.activeFaults.forEach(fault => {
      switch (fault.type) {
        case 'overheating':
          engineTemp = Math.max(engineTemp, fault.parameters.engineTemp || 105)
          break
        case 'low_oil_pressure':
          oilPressure = Math.min(oilPressure, fault.parameters.oilPressure || 1.5)
          break
        case 'battery_drain':
          batteryVoltage = Math.min(batteryVoltage, fault.parameters.batteryVoltage || 11.5)
          break
        case 'high_vibration':
          engineVibration = Math.max(engineVibration, fault.parameters.engineVibration || 40)
          break
        case 'engine_stall':
          rpm = Math.min(rpm, fault.parameters.rpm || 500)
          break
      }
    })

    // Apply additional fault injection if enabled
    if (config.faultInjection) {
      const faultChance = Math.random()
      if (faultChance < 0.05) { // 5% chance per reading
        const faultType = Math.random()
        if (faultType < 0.25) {
          engineTemp += 15 + Math.random() * 20
        } else if (faultType < 0.5) {
          oilPressure *= 0.3 + Math.random() * 0.4
        } else if (faultType < 0.75) {
          batteryVoltage -= 1 + Math.random() * 2
        } else {
          engineVibration += 20 + Math.random() * 30
        }
      }
    }

    // Clamp values to valid ranges
    engineTemp = this.clampValue(engineTemp, this.ranges.engineTemp)
    oilPressure = this.clampValue(oilPressure, this.ranges.oilPressure)
    batteryVoltage = this.clampValue(batteryVoltage, this.ranges.batteryVoltage)
    engineVibration = this.clampValue(engineVibration, this.ranges.engineVibration)
    rpm = this.clampValue(rpm, this.ranges.rpm)

    return {
      engineTemp: Math.round(engineTemp * 10) / 10,
      oilPressure: Math.round(oilPressure * 10) / 10,
      batteryVoltage: Math.round(batteryVoltage * 10) / 10,
      engineVibration: Math.round(engineVibration * 10) / 10,
      rpm: Math.round(rpm),
      timestamp: new Date()
    }
  }

  // Calculate parameter value with trend and noise
  private calculateParameterValue(
    param: { base: number; variation: number; trend: number },
    elapsedSeconds: number,
    noiseLevel: number
  ): number {
    // Base value with trend over time
    const trendValue = param.base + (param.trend * elapsedSeconds)
    
    // Add natural variation
    const variation = (Math.random() - 0.5) * param.variation * 2
    
    // Add noise based on config
    const noise = (Math.random() - 0.5) * param.variation * noiseLevel
    
    return trendValue + variation + noise
  }

  // Update active faults based on elapsed time
  private updateActiveFaults(elapsedSeconds: number) {
    if (!this.currentScenario?.faults) return

    // Remove expired faults
    this.activeFaults = this.activeFaults.filter(fault => {
      const faultEndTime = fault.startTime + fault.duration
      return elapsedSeconds < faultEndTime
    })

    // Add new faults that should start
    this.currentScenario.faults.forEach(fault => {
      const isAlreadyActive = this.activeFaults.some(af => af === fault)
      const shouldStart = elapsedSeconds >= fault.startTime
      const shouldEnd = elapsedSeconds >= (fault.startTime + fault.duration)

      if (shouldStart && !shouldEnd && !isAlreadyActive) {
        this.activeFaults.push(fault)
      }
    })
  }

  // Clamp value to valid range
  private clampValue(value: number, range: { min: number; max: number }): number {
    return Math.max(range.min, Math.min(range.max, value))
  }

  // Fallback basic data generation
  private generateBasicData(config: SensorConfig): SensorData {
    const ranges = this.ranges
    
    let engineTemp = 85 + (Math.random() - 0.5) * 10
    let oilPressure = 4.2 + (Math.random() - 0.5) * 1
    let batteryVoltage = 12.6 + (Math.random() - 0.5) * 0.8
    let engineVibration = 15 + (Math.random() - 0.5) * 10
    let rpm = 2000 + (Math.random() - 0.5) * 500

    // Add noise
    const noiseMultiplier = config.noiseLevel
    engineTemp += (Math.random() - 0.5) * 5 * noiseMultiplier
    oilPressure += (Math.random() - 0.5) * 0.5 * noiseMultiplier
    batteryVoltage += (Math.random() - 0.5) * 0.3 * noiseMultiplier
    engineVibration += (Math.random() - 0.5) * 5 * noiseMultiplier
    rpm += (Math.random() - 0.5) * 200 * noiseMultiplier

    // Fault injection
    if (config.faultInjection) {
      const faultType = Math.random()
      if (faultType < 0.1) {
        engineTemp = ranges.engineTemp.critical.min + Math.random() * 20
      } else if (faultType < 0.15) {
        oilPressure = ranges.oilPressure.critical.max * Math.random()
      } else if (faultType < 0.2) {
        batteryVoltage = ranges.batteryVoltage.warning.min + Math.random() * 0.5
      } else if (faultType < 0.25) {
        engineVibration = ranges.engineVibration.warning.min + Math.random() * 30
      }
    }

    // Clamp values
    engineTemp = this.clampValue(engineTemp, ranges.engineTemp)
    oilPressure = this.clampValue(oilPressure, ranges.oilPressure)
    batteryVoltage = this.clampValue(batteryVoltage, ranges.batteryVoltage)
    engineVibration = this.clampValue(engineVibration, ranges.engineVibration)
    rpm = this.clampValue(rpm, ranges.rpm)

    return {
      engineTemp: Math.round(engineTemp * 10) / 10,
      oilPressure: Math.round(oilPressure * 10) / 10,
      batteryVoltage: Math.round(batteryVoltage * 10) / 10,
      engineVibration: Math.round(engineVibration * 10) / 10,
      rpm: Math.round(rpm),
      timestamp: new Date()
    }
  }

  // Get current scenario info
  getCurrentScenario(): SimulationScenario | null {
    return this.currentScenario
  }

  // Get active faults
  getActiveFaults(): FaultEvent[] {
    return [...this.activeFaults]
  }

  // Get elapsed time in current scenario
  getElapsedTime(): number {
    if (!this.currentScenario) return 0
    return (Date.now() - this.startTime) / 1000
  }

  // Check if scenario is complete
  isScenarioComplete(): boolean {
    if (!this.currentScenario) return false
    return this.getElapsedTime() >= this.currentScenario.duration
  }
}