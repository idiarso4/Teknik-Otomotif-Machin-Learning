// Types untuk Arduino IDE simulator

export interface ArduinoProject {
  id?: number
  name: string
  code: string
  pinConfig: PinConfig[]
  createdAt: Date
  modifiedAt: Date
}

export interface PinConfig {
  pin: number
  mode: PinMode
  value: number
  connected: boolean
  label?: string
  sensorType?: SensorType
}

export type PinMode = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'

export type SensorType = 
  | 'temperature'
  | 'pressure'
  | 'voltage'
  | 'vibration'
  | 'rpm'
  | 'digital'
  | 'analog'

export interface CompileResult {
  success: boolean
  errors: CompileError[]
  warnings: CompileWarning[]
  memoryUsage?: MemoryUsage
}

export interface CompileError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
}

export interface CompileWarning {
  line: number
  column: number
  message: string
}

export interface MemoryUsage {
  program: number      // Program storage space used
  data: number         // Dynamic memory used
  programMax: number   // Maximum program storage space
  dataMax: number      // Maximum dynamic memory
}

export interface SerialMessage {
  timestamp: Date
  message: string
  type: 'output' | 'input' | 'error'
}

export interface ArduinoBoard {
  name: string
  digitalPins: number
  analogPins: number
  pwmPins: number[]
  maxVoltage: number
  clockSpeed: number   // MHz
}

// Default Arduino boards
export const ARDUINO_BOARDS: Record<string, ArduinoBoard> = {
  uno: {
    name: 'Arduino Uno',
    digitalPins: 14,
    analogPins: 6,
    pwmPins: [3, 5, 6, 9, 10, 11],
    maxVoltage: 5,
    clockSpeed: 16
  },
  nano: {
    name: 'Arduino Nano',
    digitalPins: 14,
    analogPins: 8,
    pwmPins: [3, 5, 6, 9, 10, 11],
    maxVoltage: 5,
    clockSpeed: 16
  }
}

// Template kode Arduino untuk sensor otomotif
export const ARDUINO_TEMPLATES = {
  temperature: `
// Sensor Suhu Mesin
#define TEMP_PIN A0
#define TEMP_COEFFICIENT 0.48828125  // 5V/1024 ADC resolution

void setup() {
  Serial.begin(9600);
  Serial.println("Sensor Suhu Mesin - Siap");
}

void loop() {
  int sensorValue = analogRead(TEMP_PIN);
  float voltage = sensorValue * TEMP_COEFFICIENT;
  float temperature = (voltage - 0.5) * 100;  // LM35 formula
  
  Serial.print("Suhu Mesin: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  delay(1000);
}
`,
  pressure: `
// Sensor Tekanan Oli
#define PRESSURE_PIN A1
#define PRESSURE_MAX 10.0  // Maximum pressure in bar

void setup() {
  Serial.begin(9600);
  Serial.println("Sensor Tekanan Oli - Siap");
}

void loop() {
  int sensorValue = analogRead(PRESSURE_PIN);
  float voltage = (sensorValue * 5.0) / 1024.0;
  float pressure = (voltage / 5.0) * PRESSURE_MAX;
  
  Serial.print("Tekanan Oli: ");
  Serial.print(pressure);
  Serial.println(" bar");
  
  if (pressure < 1.5) {
    Serial.println("PERINGATAN: Tekanan oli rendah!");
  }
  
  delay(500);
}
`,
  voltage: `
// Monitor Tegangan Baterai
#define VOLTAGE_PIN A2
#define VOLTAGE_DIVIDER 0.2  // Voltage divider ratio

void setup() {
  Serial.begin(9600);
  Serial.println("Monitor Tegangan Baterai - Siap");
}

void loop() {
  int sensorValue = analogRead(VOLTAGE_PIN);
  float measuredVoltage = (sensorValue * 5.0) / 1024.0;
  float batteryVoltage = measuredVoltage / VOLTAGE_DIVIDER;
  
  Serial.print("Tegangan Baterai: ");
  Serial.print(batteryVoltage);
  Serial.println(" V");
  
  if (batteryVoltage < 12.0) {
    Serial.println("PERINGATAN: Tegangan baterai rendah!");
  }
  
  delay(1000);
}
`
}