"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Play, 
  Square, 
  RotateCcw, 
  ExternalLink, 
  Code,
  Cpu,
  Zap,
  Settings,
  Download,
  Share,
  Maximize
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WokwiProject {
  id: string
  title: string
  description: string
  code: string
  diagram: string
  libraries?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'electrical' | 'cooling' | 'fuel' | 'vibration'
  objectives: string[]
  wokwiUrl?: string
}

const WOKWI_PROJECTS: WokwiProject[] = [
  {
    id: "engine-temp-monitor",
    title: "Engine Temperature Monitor",
    description: "Monitor engine temperature using DS18B20 sensor with LCD display and warning system",
    difficulty: "beginner",
    category: "cooling",
    objectives: [
      "Connect DS18B20 temperature sensor",
      "Display temperature on LCD",
      "Implement warning system with LED and buzzer",
      "Understand temperature sensor calibration"
    ],
    code: `#include <OneWire.h>
#include <DallasTemperature.h>
#include <LiquidCrystal.h>

// Pin definitions
#define ONE_WIRE_BUS 2
#define TEMP_POWER_PIN 3
#define BUZZER_PIN 8
#define LED_PIN 13

// Temperature sensor setup
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// LCD setup (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Temperature thresholds
const float TEMP_WARNING = 85.0;  // Warning temperature in Celsius
const float TEMP_CRITICAL = 95.0; // Critical temperature in Celsius

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(TEMP_POWER_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Power up the sensor
  digitalWrite(TEMP_POWER_PIN, HIGH);
  
  // Initialize temperature sensor
  sensors.begin();
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.print("Engine Temp");
  lcd.setCursor(0, 1);
  lcd.print("Monitor v1.0");
  
  delay(2000);
  lcd.clear();
  
  Serial.println("Engine Temperature Monitor Started");
}

void loop() {
  // Request temperature reading
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);
  
  // Check if reading is valid
  if (tempC != DEVICE_DISCONNECTED_C) {
    // Display on LCD
    lcd.setCursor(0, 0);
    lcd.print("Engine Temp:");
    lcd.setCursor(0, 1);
    lcd.print(tempC, 1);
    lcd.print(" C");
    
    // Clear previous status
    lcd.setCursor(8, 1);
    lcd.print("        ");
    
    // Check temperature status
    if (tempC >= TEMP_CRITICAL) {
      lcd.setCursor(8, 1);
      lcd.print("CRITICAL");
      digitalWrite(LED_PIN, HIGH);
      tone(BUZZER_PIN, 1000, 500);
      Serial.println("CRITICAL: Engine overheating!");
    } else if (tempC >= TEMP_WARNING) {
      lcd.setCursor(8, 1);
      lcd.print("WARNING");
      digitalWrite(LED_PIN, HIGH);
      tone(BUZZER_PIN, 800, 200);
      Serial.println("WARNING: Engine temperature high");
    } else {
      lcd.setCursor(8, 1);
      lcd.print("NORMAL");
      digitalWrite(LED_PIN, LOW);
      Serial.println("Engine temperature normal");
    }
    
    // Send data to serial
    Serial.print("Temperature: ");
    Serial.print(tempC);
    Serial.println(" C");
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Sensor Error!");
    Serial.println("Error: Could not read temperature sensor");
  }
  
  delay(1000);
}`,
    diagram: `{
  "version": 1,
  "author": "SMK Negeri 1 Punggelan",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-lcd1602", "id": "lcd", "top": -100, "left": 200, "attrs": {} },
    { "type": "wokwi-ds18b20", "id": "temp", "top": 100, "left": 300, "attrs": {} },
    { "type": "wokwi-led", "id": "led", "top": 200, "left": 100, "attrs": { "color": "red" } },
    { "type": "wokwi-buzzer", "id": "buzzer", "top": 250, "left": 200, "attrs": {} },
    { "type": "wokwi-resistor", "id": "r1", "top": 150, "left": 150, "attrs": { "value": "220" } }
  ],
  "connections": [
    [ "uno:GND.1", "lcd:VSS", "black", [ "h0" ] ],
    [ "uno:5V", "lcd:VDD", "red", [ "h0" ] ],
    [ "uno:12", "lcd:RS", "blue", [ "h0" ] ],
    [ "uno:11", "lcd:E", "green", [ "h0" ] ],
    [ "uno:5", "lcd:D4", "yellow", [ "h0" ] ],
    [ "uno:4", "lcd:D5", "orange", [ "h0" ] ],
    [ "uno:3", "lcd:D6", "purple", [ "h0" ] ],
    [ "uno:2", "lcd:D7", "gray", [ "h0" ] ],
    [ "uno:2", "temp:DQ", "white", [ "h0" ] ],
    [ "uno:GND.2", "temp:GND", "black", [ "h0" ] ],
    [ "uno:5V", "temp:VDD", "red", [ "h0" ] ],
    [ "uno:13", "r1:1", "red", [ "h0" ] ],
    [ "r1:2", "led:A", "red", [ "h0" ] ],
    [ "led:C", "uno:GND.3", "black", [ "h0" ] ],
    [ "uno:8", "buzzer:1", "green", [ "h0" ] ],
    [ "buzzer:2", "uno:GND.4", "black", [ "h0" ] ]
  ]
}`,
    libraries: ["OneWire", "DallasTemperature", "LiquidCrystal"],
    wokwiUrl: "https://wokwi.com/projects/new/arduino-uno"
  },
  {
    id: "oil-pressure-monitor",
    title: "Oil Pressure Monitoring System",
    description: "Monitor oil pressure using analog sensor with gauge display and alert system",
    difficulty: "intermediate",
    category: "fuel",
    objectives: [
      "Read analog pressure sensor",
      "Convert ADC values to pressure units",
      "Display pressure on analog gauge",
      "Implement low pressure warning"
    ],
    code: `#include <LiquidCrystal.h>
#include <Servo.h>

// Pin definitions
#define PRESSURE_SENSOR_PIN A0
#define GAUGE_SERVO_PIN 9
#define WARNING_LED_PIN 13
#define BUZZER_PIN 8

// LCD setup (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Servo for analog gauge
Servo gaugeServo;

// Pressure thresholds (in PSI)
const float MIN_PRESSURE = 20.0;
const float MAX_PRESSURE = 80.0;
const float WARNING_PRESSURE = 25.0;

// Calibration values
const float SENSOR_MIN_VOLTAGE = 0.5;  // Voltage at 0 PSI
const float SENSOR_MAX_VOLTAGE = 4.5;  // Voltage at max PSI

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(WARNING_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize servo
  gaugeServo.attach(GAUGE_SERVO_PIN);
  gaugeServo.write(0); // Start at 0 position
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.print("Oil Pressure");
  lcd.setCursor(0, 1);
  lcd.print("Monitor v1.0");
  
  delay(2000);
  lcd.clear();
  
  Serial.println("Oil Pressure Monitor Started");
}

void loop() {
  // Read analog sensor
  int sensorValue = analogRead(PRESSURE_SENSOR_PIN);
  
  // Convert to voltage
  float voltage = (sensorValue * 5.0) / 1024.0;
  
  // Convert voltage to pressure (PSI)
  float pressure = 0;
  if (voltage >= SENSOR_MIN_VOLTAGE && voltage <= SENSOR_MAX_VOLTAGE) {
    pressure = ((voltage - SENSOR_MIN_VOLTAGE) / (SENSOR_MAX_VOLTAGE - SENSOR_MIN_VOLTAGE)) * MAX_PRESSURE;
  }
  
  // Update LCD display
  lcd.setCursor(0, 0);
  lcd.print("Oil Pressure:");
  lcd.setCursor(0, 1);
  lcd.print(pressure, 1);
  lcd.print(" PSI");
  
  // Clear previous status
  lcd.setCursor(8, 1);
  lcd.print("        ");
  
  // Update analog gauge (servo position 0-180 degrees)
  int servoPosition = map(pressure * 10, 0, MAX_PRESSURE * 10, 0, 180);
  servoPosition = constrain(servoPosition, 0, 180);
  gaugeServo.write(servoPosition);
  
  // Check pressure status
  if (pressure < WARNING_PRESSURE && pressure > 0) {
    lcd.setCursor(8, 1);
    lcd.print("LOW!");
    digitalWrite(WARNING_LED_PIN, HIGH);
    tone(BUZZER_PIN, 800, 200);
    Serial.println("WARNING: Low oil pressure!");
  } else if (pressure >= WARNING_PRESSURE) {
    lcd.setCursor(8, 1);
    lcd.print("OK");
    digitalWrite(WARNING_LED_PIN, LOW);
    Serial.println("Oil pressure normal");
  } else {
    lcd.setCursor(8, 1);
    lcd.print("ERROR");
    digitalWrite(WARNING_LED_PIN, HIGH);
    Serial.println("Error: Sensor reading invalid");
  }
  
  // Send data to serial
  Serial.print("Pressure: ");
  Serial.print(pressure, 2);
  Serial.print(" PSI, Voltage: ");
  Serial.print(voltage, 3);
  Serial.println(" V");
  
  delay(500);
}`,
    diagram: `{
  "version": 1,
  "author": "SMK Negeri 1 Punggelan",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-lcd1602", "id": "lcd", "top": -100, "left": 200, "attrs": {} },
    { "type": "wokwi-analog-joystick", "id": "pressure", "top": 100, "left": 300, "attrs": {} },
    { "type": "wokwi-servo", "id": "gauge", "top": 200, "left": 400, "attrs": {} },
    { "type": "wokwi-led", "id": "led", "top": 250, "left": 100, "attrs": { "color": "red" } },
    { "type": "wokwi-buzzer", "id": "buzzer", "top": 300, "left": 200, "attrs": {} },
    { "type": "wokwi-resistor", "id": "r1", "top": 200, "left": 150, "attrs": { "value": "220" } }
  ],
  "connections": [
    [ "uno:GND.1", "lcd:VSS", "black", [ "h0" ] ],
    [ "uno:5V", "lcd:VDD", "red", [ "h0" ] ],
    [ "uno:12", "lcd:RS", "blue", [ "h0" ] ],
    [ "uno:11", "lcd:E", "green", [ "h0" ] ],
    [ "uno:5", "lcd:D4", "yellow", [ "h0" ] ],
    [ "uno:4", "lcd:D5", "orange", [ "h0" ] ],
    [ "uno:3", "lcd:D6", "purple", [ "h0" ] ],
    [ "uno:2", "lcd:D7", "gray", [ "h0" ] ],
    [ "uno:A0", "pressure:VRX", "white", [ "h0" ] ],
    [ "uno:5V", "pressure:+5V", "red", [ "h0" ] ],
    [ "uno:GND.2", "pressure:GND", "black", [ "h0" ] ],
    [ "uno:9", "gauge:PWM", "orange", [ "h0" ] ],
    [ "uno:5V", "gauge:V+", "red", [ "h0" ] ],
    [ "uno:GND.3", "gauge:GND", "black", [ "h0" ] ],
    [ "uno:13", "r1:1", "red", [ "h0" ] ],
    [ "r1:2", "led:A", "red", [ "h0" ] ],
    [ "led:C", "uno:GND.4", "black", [ "h0" ] ],
    [ "uno:8", "buzzer:1", "green", [ "h0" ] ],
    [ "buzzer:2", "uno:GND.5", "black", [ "h0" ] ]
  ]
}`,
    libraries: ["LiquidCrystal", "Servo"],
    wokwiUrl: "https://wokwi.com/projects/new/arduino-uno"
  },
  {
    id: "battery-voltage-monitor",
    title: "Battery Voltage Monitoring",
    description: "Monitor battery voltage with voltage divider circuit and charging status indicator",
    difficulty: "beginner",
    category: "electrical",
    objectives: [
      "Implement voltage divider circuit",
      "Read and calibrate voltage measurements",
      "Display voltage on 7-segment display",
      "Indicate charging status with LEDs"
    ],
    code: `#include <LiquidCrystal.h>

// Pin definitions
#define VOLTAGE_SENSOR_PIN A0
#define CHARGING_LED_PIN 12
#define LOW_BATTERY_LED_PIN 13
#define BUZZER_PIN 8

// LCD setup (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(11, 10, 5, 4, 3, 2);

// Voltage thresholds
const float LOW_VOLTAGE = 12.0;
const float CHARGING_VOLTAGE = 13.8;
const float OVERCHARGE_VOLTAGE = 14.5;

// Voltage divider ratio (R1=10k, R2=10k for 12V max input)
const float VOLTAGE_DIVIDER_RATIO = 2.0;

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(CHARGING_LED_PIN, OUTPUT);
  pinMode(LOW_BATTERY_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.print("Battery Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  
  delay(2000);
  lcd.clear();
  
  Serial.println("Battery Voltage Monitor Started");
}

void loop() {
  // Read analog sensor
  int sensorValue = analogRead(VOLTAGE_SENSOR_PIN);
  
  // Convert to voltage (accounting for voltage divider)
  float voltage = (sensorValue * 5.0 / 1024.0) * VOLTAGE_DIVIDER_RATIO;
  
  // Update LCD display
  lcd.setCursor(0, 0);
  lcd.print("Battery: ");
  lcd.print(voltage, 2);
  lcd.print("V");
  
  // Clear previous status
  lcd.setCursor(0, 1);
  lcd.print("                ");
  lcd.setCursor(0, 1);
  
  // Reset LEDs
  digitalWrite(CHARGING_LED_PIN, LOW);
  digitalWrite(LOW_BATTERY_LED_PIN, LOW);
  
  // Check voltage status
  if (voltage < LOW_VOLTAGE) {
    lcd.print("Status: LOW BATT");
    digitalWrite(LOW_BATTERY_LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000, 200);
    Serial.println("WARNING: Low battery voltage!");
  } else if (voltage >= CHARGING_VOLTAGE && voltage <= OVERCHARGE_VOLTAGE) {
    lcd.print("Status: CHARGING");
    digitalWrite(CHARGING_LED_PIN, HIGH);
    Serial.println("Battery charging normally");
  } else if (voltage > OVERCHARGE_VOLTAGE) {
    lcd.print("Status: OVERCHG!");
    digitalWrite(LOW_BATTERY_LED_PIN, HIGH);
    tone(BUZZER_PIN, 800, 300);
    Serial.println("WARNING: Overcharging detected!");
  } else {
    lcd.print("Status: NORMAL");
    Serial.println("Battery voltage normal");
  }
  
  // Send data to serial
  Serial.print("Battery Voltage: ");
  Serial.print(voltage, 3);
  Serial.print("V (ADC: ");
  Serial.print(sensorValue);
  Serial.println(")");
  
  delay(1000);
}`,
    diagram: `{
  "version": 1,
  "author": "SMK Negeri 1 Punggelan",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-lcd1602", "id": "lcd", "top": -100, "left": 200, "attrs": {} },
    { "type": "wokwi-potentiometer", "id": "voltage", "top": 100, "left": 300, "attrs": {} },
    { "type": "wokwi-led", "id": "charging_led", "top": 200, "left": 100, "attrs": { "color": "green" } },
    { "type": "wokwi-led", "id": "low_led", "top": 250, "left": 100, "attrs": { "color": "red" } },
    { "type": "wokwi-buzzer", "id": "buzzer", "top": 300, "left": 200, "attrs": {} },
    { "type": "wokwi-resistor", "id": "r1", "top": 150, "left": 150, "attrs": { "value": "220" } },
    { "type": "wokwi-resistor", "id": "r2", "top": 200, "left": 150, "attrs": { "value": "220" } }
  ],
  "connections": [
    [ "uno:GND.1", "lcd:VSS", "black", [ "h0" ] ],
    [ "uno:5V", "lcd:VDD", "red", [ "h0" ] ],
    [ "uno:11", "lcd:RS", "blue", [ "h0" ] ],
    [ "uno:10", "lcd:E", "green", [ "h0" ] ],
    [ "uno:5", "lcd:D4", "yellow", [ "h0" ] ],
    [ "uno:4", "lcd:D5", "orange", [ "h0" ] ],
    [ "uno:3", "lcd:D6", "purple", [ "h0" ] ],
    [ "uno:2", "lcd:D7", "gray", [ "h0" ] ],
    [ "uno:A0", "voltage:SIG", "white", [ "h0" ] ],
    [ "uno:5V", "voltage:VCC", "red", [ "h0" ] ],
    [ "uno:GND.2", "voltage:GND", "black", [ "h0" ] ],
    [ "uno:12", "r1:1", "green", [ "h0" ] ],
    [ "r1:2", "charging_led:A", "green", [ "h0" ] ],
    [ "charging_led:C", "uno:GND.3", "black", [ "h0" ] ],
    [ "uno:13", "r2:1", "red", [ "h0" ] ],
    [ "r2:2", "low_led:A", "red", [ "h0" ] ],
    [ "low_led:C", "uno:GND.4", "black", [ "h0" ] ],
    [ "uno:8", "buzzer:1", "orange", [ "h0" ] ],
    [ "buzzer:2", "uno:GND.5", "black", [ "h0" ] ]
  ]
}`,
    libraries: ["LiquidCrystal"],
    wokwiUrl: "https://wokwi.com/projects/new/arduino-uno"
  }
]

interface WokwiSimulatorProps {
  project?: WokwiProject
  onProjectComplete?: (projectId: string) => void
  embedded?: boolean
}

export function WokwiSimulator({ project, onProjectComplete, embedded = false }: WokwiSimulatorProps) {
  const [selectedProject, setSelectedProject] = useState<WokwiProject | null>(project || null)
  const [isSimulatorLoaded, setIsSimulatorLoaded] = useState(false)
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { toast } = useToast()

  const generateWokwiUrl = (project: WokwiProject) => {
    // Create a new Wokwi project URL with the code and diagram
    const baseUrl = "https://wokwi.com/projects/new/arduino-uno"
    
    // For now, we'll use the base URL and let users copy the code
    // In a real implementation, you might use Wokwi's API to create projects
    return baseUrl
  }

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Kode Disalin",
        description: "Kode Arduino telah disalin ke clipboard",
        variant: "success"
      })
    })
  }

  const openInWokwi = (project: WokwiProject) => {
    const url = generateWokwiUrl(project)
    window.open(url, '_blank')
    toast({
      title: "Membuka Wokwi",
      description: "Simulator Wokwi dibuka di tab baru",
      variant: "default"
    })
  }

  const completeObjective = (objective: string) => {
    if (!completedObjectives.includes(objective)) {
      setCompletedObjectives(prev => [...prev, objective])
      toast({
        title: "Objektif Tercapai!",
        description: objective,
        variant: "success"
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electrical': return <Zap className="h-4 w-4" />
      case 'cooling': return <Settings className="h-4 w-4" />
      case 'fuel': return <Settings className="h-4 w-4" />
      case 'vibration': return <Settings className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  if (!selectedProject && !embedded) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Pilih Proyek Wokwi</h3>
          <p className="text-muted-foreground">
            Pilih proyek simulasi Arduino untuk dipraktikkan
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {WOKWI_PROJECTS.map((proj) => (
            <Card 
              key={proj.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProject(proj)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(proj.category)}
                    <CardTitle className="text-base">{proj.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(proj.difficulty)}>
                    {proj.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{proj.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{proj.objectives.length} objectives</span>
                  <span>{proj.libraries?.length || 0} libraries</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!selectedProject) return null

  const objectiveProgress = (completedObjectives.length / selectedProject.objectives.length) * 100

  return (
    <div className="space-y-6">
      {/* Project Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedProject(null)}
              className="mb-2"
            >
              ← Kembali ke Daftar Proyek
            </Button>
            <h3 className="text-xl font-bold">{selectedProject.title}</h3>
            <p className="text-muted-foreground">{selectedProject.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(selectedProject.difficulty)}>
              {selectedProject.difficulty}
            </Badge>
            <Badge variant="outline">
              {getCategoryIcon(selectedProject.category)}
              {selectedProject.category}
            </Badge>
          </div>
        </div>
      )}

      {/* Simulator and Code */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wokwi Simulator */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Wokwi Simulator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInWokwi(selectedProject)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka di Wokwi
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-muted/20">
              <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Simulasi Arduino</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Klik tombol di bawah untuk membuka simulator Wokwi dan mulai praktik
              </p>
              <div className="space-y-2">
                <Button onClick={() => openInWokwi(selectedProject)}>
                  <Play className="h-4 w-4 mr-2" />
                  Mulai Simulasi
                </Button>
                <p className="text-xs text-muted-foreground">
                  Simulator akan terbuka di tab baru
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arduino Code */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Arduino Code
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyCodeToClipboard(selectedProject.code)}
            >
              <Download className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[400px] overflow-y-auto">
              <pre>{selectedProject.code}</pre>
            </div>
            {selectedProject.libraries && selectedProject.libraries.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Required Libraries:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.libraries.map((lib, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {lib}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Objektif Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(objectiveProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${objectiveProgress}%` }}
            />
          </div>
          
          <Separator />
          
          <div className="grid gap-2">
            {selectedProject.objectives.map((objective, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  completedObjectives.includes(objective) 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => completeObjective(objective)}
                  disabled={completedObjectives.includes(objective)}
                >
                  {completedObjectives.includes(objective) ? (
                    <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                </Button>
                <span className={cn(
                  "flex-1 text-sm",
                  completedObjectives.includes(objective) && "line-through text-muted-foreground"
                )}>
                  {objective}
                </span>
              </div>
            ))}
          </div>

          {objectiveProgress === 100 && onProjectComplete && (
            <div className="text-center pt-4">
              <Button 
                onClick={() => onProjectComplete(selectedProject.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Selesaikan Proyek
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Petunjuk Penggunaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">1.</span>
              <span>Klik "Buka di Wokwi" untuk membuka simulator di tab baru</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">2.</span>
              <span>Copy kode Arduino dan paste ke editor Wokwi</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">3.</span>
              <span>Tambahkan komponen sesuai dengan diagram rangkaian</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">4.</span>
              <span>Hubungkan komponen sesuai dengan konfigurasi pin</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">5.</span>
              <span>Jalankan simulasi dan amati hasilnya</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">6.</span>
              <span>Centang objektif pembelajaran yang telah dicapai</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { WOKWI_PROJECTS }
