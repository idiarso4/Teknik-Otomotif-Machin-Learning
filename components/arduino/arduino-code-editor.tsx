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
  Upload, 
  Download, 
  Save, 
  FileText,
  Code,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-md">
      <div className="text-center">
        <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  )
})

interface CompilationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  memoryUsage: {
    program: number
    data: number
    maxProgram: number
    maxData: number
  }
}

const DEFAULT_ARDUINO_CODE = `// Arduino Automotive Sensor Monitor
// SMK Negeri 1 Punggelan - Simulasi AI Otomotif

#include <LiquidCrystal.h>

// Pin definitions
const int tempSensorPin = A0;
const int oilPressurePin = A1;
const int batteryVoltagePin = A2;
const int rpmSensorPin = 2;
const int buzzerPin = 8;
const int ledPin = 13;

// LCD pins: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Variables
float engineTemp = 0;
float oilPressure = 0;
float batteryVoltage = 0;
int engineRPM = 0;
unsigned long lastRPMTime = 0;
volatile int rpmPulses = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.print("Engine Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  
  // Initialize pins
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(rpmSensorPin, INPUT_PULLUP);
  
  // Attach interrupt for RPM sensor
  attachInterrupt(digitalPinToInterrupt(rpmSensorPin), rpmCounter, FALLING);
  
  delay(2000);
  lcd.clear();
}

void loop() {
  // Read sensors
  readSensors();
  
  // Display on LCD
  displayData();
  
  // Send data to serial
  sendSerialData();
  
  // Check for warnings
  checkWarnings();
  
  delay(1000);
}

void readSensors() {
  // Read temperature (convert ADC to Celsius)
  int tempReading = analogRead(tempSensorPin);
  engineTemp = (tempReading * 5.0 / 1024.0 - 0.5) * 100;
  
  // Read oil pressure (convert ADC to PSI)
  int pressureReading = analogRead(oilPressurePin);
  oilPressure = (pressureReading * 5.0 / 1024.0) * 20; // 0-5V = 0-100 PSI
  
  // Read battery voltage
  int voltageReading = analogRead(batteryVoltagePin);
  batteryVoltage = (voltageReading * 5.0 / 1024.0) * 3; // Voltage divider
  
  // Calculate RPM
  if (millis() - lastRPMTime >= 1000) {
    engineRPM = (rpmPulses * 60) / 2; // 2 pulses per revolution
    rpmPulses = 0;
    lastRPMTime = millis();
  }
}

void displayData() {
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(engineTemp, 1);
  lcd.print("C P:");
  lcd.print(oilPressure, 1);
  
  lcd.setCursor(0, 1);
  lcd.print("V:");
  lcd.print(batteryVoltage, 1);
  lcd.print(" RPM:");
  lcd.print(engineRPM);
}

void sendSerialData() {
  Serial.print("TEMP:");
  Serial.print(engineTemp);
  Serial.print(",PRESSURE:");
  Serial.print(oilPressure);
  Serial.print(",VOLTAGE:");
  Serial.print(batteryVoltage);
  Serial.print(",RPM:");
  Serial.println(engineRPM);
}

void checkWarnings() {
  bool warning = false;
  
  // Check temperature
  if (engineTemp > 95) {
    warning = true;
    Serial.println("WARNING: Engine temperature high!");
  }
  
  // Check oil pressure
  if (oilPressure < 20) {
    warning = true;
    Serial.println("WARNING: Oil pressure low!");
  }
  
  // Check battery voltage
  if (batteryVoltage < 12.0) {
    warning = true;
    Serial.println("WARNING: Battery voltage low!");
  }
  
  // Activate warning indicators
  if (warning) {
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000, 200);
  } else {
    digitalWrite(ledPin, LOW);
  }
}

void rpmCounter() {
  rpmPulses++;
}
`

export function ArduinoCodeEditor() {
  const [code, setCode] = useState(DEFAULT_ARDUINO_CODE)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null)
  const [fileName, setFileName] = useState("automotive_monitor.ino")
  const { toast } = useToast()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure Arduino C++ language support
    monaco.languages.register({ id: 'arduino' })
    monaco.languages.setMonarchTokensProvider('arduino', {
      tokenizer: {
        root: [
          [/\b(void|int|float|char|bool|String|byte|word|long|short|double)\b/, 'type'],
          [/\b(setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|Serial|attachInterrupt)\b/, 'keyword'],
          [/\b(HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|A0|A1|A2|A3|A4|A5)\b/, 'constant'],
          [/\/\/.*$/, 'comment'],
          [/\/\*[\s\S]*?\*\//, 'comment'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\b\d+\b/, 'number'],
        ]
      }
    })
  }

  const simulateCompilation = async (): Promise<CompilationResult> => {
    // Simulate compilation process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // Simple syntax checking
    if (!code.includes('void setup()')) {
      errors.push("Error: 'setup()' function not found")
    }
    if (!code.includes('void loop()')) {
      errors.push("Error: 'loop()' function not found")
    }
    if (code.includes('Serial.') && !code.includes('Serial.begin(')) {
      warnings.push("Warning: Serial communication used but not initialized")
    }
    
    // Check for common mistakes
    const lines = code.split('\n')
    lines.forEach((line, index) => {
      if (line.includes('analogRead') && !line.includes('A')) {
        warnings.push(`Warning: Line ${index + 1}: Consider using analog pin constants (A0, A1, etc.)`)
      }
      if (line.includes('delay(') && line.includes('delay(0')) {
        warnings.push(`Warning: Line ${index + 1}: Zero delay may cause issues`)
      }
    })

    return {
      success: errors.length === 0,
      errors,
      warnings,
      memoryUsage: {
        program: Math.floor(Math.random() * 20000) + 5000,
        data: Math.floor(Math.random() * 1500) + 500,
        maxProgram: 32256,
        maxData: 2048
      }
    }
  }

  const handleCompile = async () => {
    setIsCompiling(true)
    try {
      const result = await simulateCompilation()
      setCompilationResult(result)
      
      if (result.success) {
        toast({
          title: "Kompilasi Berhasil",
          description: `Program berhasil dikompilasi. Memory usage: ${result.memoryUsage.program} bytes`,
          variant: "success"
        })
      } else {
        toast({
          title: "Kompilasi Gagal",
          description: `Ditemukan ${result.errors.length} error`,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat kompilasi",
        variant: "destructive"
      })
    } finally {
      setIsCompiling(false)
    }
  }

  const handleRun = () => {
    if (!compilationResult?.success) {
      toast({
        title: "Tidak Dapat Menjalankan",
        description: "Kompilasi program terlebih dahulu",
        variant: "destructive"
      })
      return
    }
    
    setIsRunning(!isRunning)
    toast({
      title: isRunning ? "Program Dihentikan" : "Program Dijalankan",
      description: isRunning ? "Simulasi Arduino dihentikan" : "Simulasi Arduino dimulai",
      variant: "default"
    })
  }

  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "File Tersimpan",
      description: `${fileName} berhasil disimpan`,
      variant: "success"
    })
  }

  const handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ino,.cpp,.c'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setCode(content)
          setFileName(file.name)
          toast({
            title: "File Dimuat",
            description: `${file.name} berhasil dimuat`,
            variant: "success"
          })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Arduino Code Editor
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {fileName} - Arduino C++ IDE Simulator
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLoad}>
            <Upload className="h-4 w-4 mr-2" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCompile}
            disabled={isCompiling}
          >
            <FileText className={cn("h-4 w-4 mr-2", isCompiling && "animate-spin")} />
            {isCompiling ? "Compiling..." : "Compile"}
          </Button>
          <Button 
            variant={isRunning ? "destructive" : "default"}
            size="sm" 
            onClick={handleRun}
          >
            {isRunning ? (
              <Square className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Stop" : "Run"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="flex items-center gap-4">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
            {compilationResult && (
              <Badge variant={compilationResult.success ? "default" : "destructive"}>
                {compilationResult.success ? "Compiled" : "Error"}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Lines: {code.split('\n').length} | Characters: {code.length}
          </div>
        </div>

        {/* Code Editor */}
        <div className="border rounded-md overflow-hidden">
          <MonacoEditor
            height="400px"
            language="cpp"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on'
            }}
          />
        </div>

        {/* Compilation Results */}
        {compilationResult && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {compilationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                Compilation Results
              </h4>
              
              {/* Memory Usage */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-muted-foreground">Program Memory</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(compilationResult.memoryUsage.program / compilationResult.memoryUsage.maxProgram) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs">
                      {compilationResult.memoryUsage.program} / {compilationResult.memoryUsage.maxProgram}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data Memory</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: `${(compilationResult.memoryUsage.data / compilationResult.memoryUsage.maxData) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs">
                      {compilationResult.memoryUsage.data} / {compilationResult.memoryUsage.maxData}
                    </span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {compilationResult.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-red-600">Errors:</div>
                  {compilationResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {compilationResult.warnings.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="text-sm font-medium text-yellow-600">Warnings:</div>
                  {compilationResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
