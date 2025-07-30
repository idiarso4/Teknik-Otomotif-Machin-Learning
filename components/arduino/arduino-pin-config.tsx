"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Cpu, 
  Zap, 
  Settings, 
  Save, 
  RotateCcw,
  Pin,
  Activity,
  Gauge,
  Thermometer,
  Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PinConfiguration {
  pin: number
  type: 'digital' | 'analog' | 'pwm'
  mode: 'input' | 'output' | 'input_pullup'
  function: string
  enabled: boolean
  value?: number
}

interface ArduinoBoard {
  name: string
  digitalPins: number[]
  analogPins: string[]
  pwmPins: number[]
}

const ARDUINO_BOARDS: ArduinoBoard[] = [
  {
    name: "Arduino Uno",
    digitalPins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    analogPins: ["A0", "A1", "A2", "A3", "A4", "A5"],
    pwmPins: [3, 5, 6, 9, 10, 11]
  },
  {
    name: "Arduino Nano",
    digitalPins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    analogPins: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
    pwmPins: [3, 5, 6, 9, 10, 11]
  }
]

const PIN_FUNCTIONS = [
  { value: "temp_sensor", label: "Temperature Sensor", icon: <Thermometer className="h-4 w-4" /> },
  { value: "pressure_sensor", label: "Pressure Sensor", icon: <Gauge className="h-4 w-4" /> },
  { value: "voltage_sensor", label: "Voltage Sensor", icon: <Zap className="h-4 w-4" /> },
  { value: "rpm_sensor", label: "RPM Sensor", icon: <Activity className="h-4 w-4" /> },
  { value: "led_indicator", label: "LED Indicator", icon: <Pin className="h-4 w-4" /> },
  { value: "buzzer", label: "Buzzer", icon: <Volume2 className="h-4 w-4" /> },
  { value: "lcd_rs", label: "LCD RS", icon: <Pin className="h-4 w-4" /> },
  { value: "lcd_enable", label: "LCD Enable", icon: <Pin className="h-4 w-4" /> },
  { value: "lcd_data", label: "LCD Data", icon: <Pin className="h-4 w-4" /> },
  { value: "unused", label: "Unused", icon: <Pin className="h-4 w-4" /> }
]

export function ArduinoPinConfig() {
  const [selectedBoard, setSelectedBoard] = useState<ArduinoBoard>(ARDUINO_BOARDS[0])
  const [pinConfigs, setPinConfigs] = useState<PinConfiguration[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Initialize pin configurations
    const configs: PinConfiguration[] = []
    
    // Digital pins
    selectedBoard.digitalPins.forEach(pin => {
      configs.push({
        pin,
        type: 'digital',
        mode: 'input',
        function: getDefaultFunction(pin),
        enabled: isDefaultEnabled(pin),
        value: 0
      })
    })
    
    // Analog pins
    selectedBoard.analogPins.forEach((pin, index) => {
      configs.push({
        pin: index,
        type: 'analog',
        mode: 'input',
        function: getDefaultAnalogFunction(index),
        enabled: isDefaultAnalogEnabled(index),
        value: 0
      })
    })
    
    setPinConfigs(configs)
  }, [selectedBoard])

  const getDefaultFunction = (pin: number): string => {
    switch (pin) {
      case 2: return "rpm_sensor"
      case 8: return "buzzer"
      case 13: return "led_indicator"
      case 12: return "lcd_rs"
      case 11: return "lcd_enable"
      case 5: case 4: case 3: case 2: return "lcd_data"
      default: return "unused"
    }
  }

  const getDefaultAnalogFunction = (index: number): string => {
    switch (index) {
      case 0: return "temp_sensor"
      case 1: return "pressure_sensor"
      case 2: return "voltage_sensor"
      default: return "unused"
    }
  }

  const isDefaultEnabled = (pin: number): boolean => {
    return [2, 3, 4, 5, 8, 11, 12, 13].includes(pin)
  }

  const isDefaultAnalogEnabled = (index: number): boolean => {
    return index < 3
  }

  const updatePinConfig = (pin: number, type: 'digital' | 'analog', field: keyof PinConfiguration, value: any) => {
    setPinConfigs(prev => prev.map(config => {
      if (config.pin === pin && config.type === type) {
        return { ...config, [field]: value }
      }
      return config
    }))
  }

  const getPinFunction = (functionValue: string) => {
    return PIN_FUNCTIONS.find(f => f.value === functionValue) || PIN_FUNCTIONS[PIN_FUNCTIONS.length - 1]
  }

  const generateArduinoCode = () => {
    const enabledConfigs = pinConfigs.filter(config => config.enabled)
    let code = "// Auto-generated pin configuration\n\n"
    
    // Pin definitions
    code += "// Pin definitions\n"
    enabledConfigs.forEach(config => {
      const pinName = config.type === 'analog' ? `A${config.pin}` : config.pin.toString()
      const functionName = config.function.replace('_', '').toUpperCase()
      code += `const int ${functionName}_PIN = ${pinName};\n`
    })
    
    code += "\nvoid setup() {\n"
    code += "  Serial.begin(9600);\n"
    
    // Pin modes
    enabledConfigs.forEach(config => {
      if (config.type === 'digital') {
        const pinName = config.pin.toString()
        const mode = config.mode.toUpperCase()
        code += `  pinMode(${pinName}, ${mode});\n`
      }
    })
    
    code += "}\n\nvoid loop() {\n"
    code += "  // Your code here\n"
    code += "}\n"
    
    return code
  }

  const saveConfiguration = () => {
    const config = {
      board: selectedBoard.name,
      pins: pinConfigs.filter(config => config.enabled)
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arduino_pin_config_${selectedBoard.name.toLowerCase().replace(' ', '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Konfigurasi Tersimpan",
      description: "Pin configuration berhasil disimpan",
      variant: "success"
    })
  }

  const resetConfiguration = () => {
    const board = selectedBoard
    setSelectedBoard({ ...board })
    toast({
      title: "Konfigurasi Direset",
      description: "Pin configuration dikembalikan ke default",
      variant: "default"
    })
  }

  const copyCode = () => {
    const code = generateArduinoCode()
    navigator.clipboard.writeText(code)
    toast({
      title: "Kode Disalin",
      description: "Arduino code berhasil disalin ke clipboard",
      variant: "success"
    })
  }

  return (
    <div className="space-y-6">
      {/* Board Selection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Arduino Pin Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure pins for automotive sensor monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedBoard.name}
              onValueChange={(value) => {
                const board = ARDUINO_BOARDS.find(b => b.name === value)
                if (board) setSelectedBoard(board)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARDUINO_BOARDS.map(board => (
                  <SelectItem key={board.name} value={board.name}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{selectedBoard.digitalPins.length}</div>
              <div className="text-sm text-muted-foreground">Digital Pins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{selectedBoard.analogPins.length}</div>
              <div className="text-sm text-muted-foreground">Analog Pins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{selectedBoard.pwmPins.length}</div>
              <div className="text-sm text-muted-foreground">PWM Pins</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pin Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Digital Pins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Digital Pins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedBoard.digitalPins.map(pin => {
              const config = pinConfigs.find(c => c.pin === pin && c.type === 'digital')
              if (!config) return null
              
              const pinFunction = getPinFunction(config.function)
              const isPWM = selectedBoard.pwmPins.includes(pin)
              
              return (
                <div key={`digital-${pin}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={config.enabled ? "default" : "secondary"}>
                        Pin {pin}
                      </Badge>
                      {isPWM && <Badge variant="outline">PWM</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {pinFunction.icon}
                      <span className="text-sm">{pinFunction.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={config.function}
                      onValueChange={(value) => updatePinConfig(pin, 'digital', 'function', value)}
                      disabled={!config.enabled}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIN_FUNCTIONS.map(func => (
                          <SelectItem key={func.value} value={func.value}>
                            {func.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={config.mode}
                      onValueChange={(value) => updatePinConfig(pin, 'digital', 'mode', value)}
                      disabled={!config.enabled}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="input">Input</SelectItem>
                        <SelectItem value="output">Output</SelectItem>
                        <SelectItem value="input_pullup">Pullup</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => updatePinConfig(pin, 'digital', 'enabled', checked)}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Analog Pins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analog Pins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedBoard.analogPins.map((pin, index) => {
              const config = pinConfigs.find(c => c.pin === index && c.type === 'analog')
              if (!config) return null
              
              const pinFunction = getPinFunction(config.function)
              
              return (
                <div key={`analog-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={config.enabled ? "default" : "secondary"}>
                      {pin}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {pinFunction.icon}
                      <span className="text-sm">{pinFunction.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={config.function}
                      onValueChange={(value) => updatePinConfig(index, 'analog', 'function', value)}
                      disabled={!config.enabled}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIN_FUNCTIONS.filter(f => 
                          f.value.includes('sensor') || f.value === 'unused'
                        ).map(func => (
                          <SelectItem key={func.value} value={func.value}>
                            {func.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => updatePinConfig(index, 'analog', 'enabled', checked)}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {pinConfigs.filter(c => c.enabled).length} pins configured
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetConfiguration}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={copyCode}>
                <Pin className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button onClick={saveConfiguration}>
                <Save className="h-4 w-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
