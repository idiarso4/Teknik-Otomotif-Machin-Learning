// Types untuk data sensor otomotif

export interface SensorData {
  id?: number
  engineTemp: number        // Suhu mesin (°C)
  oilPressure: number      // Tekanan oli (bar)
  batteryVoltage: number   // Tegangan baterai (V)
  engineVibration: number  // Getaran mesin (Hz)
  rpm: number              // RPM mesin
  timestamp: Date
}

export interface SensorConfig {
  samplingRate: number     // Frekuensi sampling (Hz)
  noiseLevel: number       // Level noise (0-1)
  faultInjection: boolean  // Aktifkan injeksi kesalahan
  autoSave: boolean        // Simpan data otomatis
}

export interface SensorRange {
  min: number
  max: number
  normal: {
    min: number
    max: number
  }
  warning: {
    min: number
    max: number
  }
  critical: {
    min: number
    max: number
  }
}

export interface SensorRanges {
  engineTemp: SensorRange
  oilPressure: SensorRange
  batteryVoltage: SensorRange
  engineVibration: SensorRange
  rpm: SensorRange
}

// Default ranges untuk sensor otomotif
export const DEFAULT_SENSOR_RANGES: SensorRanges = {
  engineTemp: {
    min: 0,
    max: 150,
    normal: { min: 80, max: 95 },
    warning: { min: 95, max: 110 },
    critical: { min: 110, max: 150 }
  },
  oilPressure: {
    min: 0,
    max: 10,
    normal: { min: 3, max: 6 },
    warning: { min: 1.5, max: 3 },
    critical: { min: 0, max: 1.5 }
  },
  batteryVoltage: {
    min: 8,
    max: 16,
    normal: { min: 12.4, max: 14.4 },
    warning: { min: 11.8, max: 12.4 },
    critical: { min: 8, max: 11.8 }
  },
  engineVibration: {
    min: 0,
    max: 100,
    normal: { min: 0, max: 20 },
    warning: { min: 20, max: 50 },
    critical: { min: 50, max: 100 }
  },
  rpm: {
    min: 0,
    max: 8000,
    normal: { min: 800, max: 3000 },
    warning: { min: 3000, max: 5000 },
    critical: { min: 5000, max: 8000 }
  }
}