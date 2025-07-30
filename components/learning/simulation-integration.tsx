"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { RealTimeLineChart } from "@/components/charts/real-time-line-chart"
import { GaugeChart } from "@/components/charts/gauge-chart"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Target,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SimulationConfig {
  type: 'voltage_measurement' | 'temperature_monitoring' | 'pressure_analysis' | 'vibration_analysis'
  parameters: string[]
  targetRange: [number, number]
  duration: number // in seconds
  objectives: string[]
  hints: string[]
}

interface SimulationResult {
  parameter: string
  value: number
  inRange: boolean
  timestamp: Date
}

const SIMULATION_CONFIGS: Record<string, SimulationConfig> = {
  voltage_measurement: {
    type: 'voltage_measurement',
    parameters: ['batteryVoltage'],
    targetRange: [12.0, 14.5],
    duration: 60,
    objectives: [
      'Ukur voltase baterai dalam kondisi mesin mati',
      'Ukur voltase saat mesin hidup',
      'Identifikasi kondisi charging system',
      'Deteksi masalah pada sistem kelistrikan'
    ],
    hints: [
      'Voltase normal saat mesin mati: 12.6V',
      'Voltase saat charging: 13.8-14.4V',
      'Voltase di bawah 12V menandakan baterai lemah',
      'Voltase di atas 14.5V menandakan overcharging'
    ]
  },
  temperature_monitoring: {
    type: 'temperature_monitoring',
    parameters: ['engineTemp'],
    targetRange: [80, 95],
    duration: 90,
    objectives: [
      'Monitor suhu mesin saat warming up',
      'Identifikasi suhu operasi normal',
      'Deteksi overheating',
      'Pahami respons sistem pendingin'
    ],
    hints: [
      'Suhu operasi normal: 80-95°C',
      'Thermostat membuka pada 82-88°C',
      'Suhu di atas 105°C berbahaya',
      'Cooling fan aktif saat suhu tinggi'
    ]
  },
  pressure_analysis: {
    type: 'pressure_analysis',
    parameters: ['oilPressure'],
    targetRange: [20, 60],
    duration: 75,
    objectives: [
      'Monitor tekanan oli saat idle',
      'Amati perubahan tekanan saat RPM naik',
      'Identifikasi tekanan oli yang normal',
      'Deteksi masalah pada sistem pelumasan'
    ],
    hints: [
      'Tekanan minimum: 20 PSI saat idle',
      'Tekanan normal: 40-60 PSI saat operasi',
      'Tekanan rendah menandakan masalah pompa oli',
      'Tekanan tinggi bisa karena oli terlalu kental'
    ]
  }
}

interface SimulationIntegrationProps {
  config: SimulationConfig
  onComplete?: (results: SimulationResult[]) => void
  onObjectiveComplete?: (objective: string) => void
}

export function SimulationIntegration({ config, onComplete, onObjectiveComplete }: SimulationIntegrationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [results, setResults] = useState<SimulationResult[]>([])
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([])
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1
        if (newTime >= config.duration) {
          setIsRunning(false)
          if (onComplete) {
            onComplete(results)
          }
          toast({
            title: "Simulasi Selesai",
            description: `Simulasi ${config.type} telah selesai`,
            variant: "success"
          })
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, config.duration, results, onComplete, toast, config.type])

  const generateSimulationValue = () => {
    const [min, max] = config.targetRange
    const range = max - min
    const center = min + range / 2
    
    // Add some realistic variation based on simulation type
    let value: number
    
    switch (config.type) {
      case 'voltage_measurement':
        // Simulate battery voltage with charging cycle
        const chargingPhase = Math.sin(currentTime / 10) * 0.5 + 0.5
        value = 12.0 + chargingPhase * 2.5 + (Math.random() - 0.5) * 0.2
        break
      case 'temperature_monitoring':
        // Simulate engine warming up
        const warmupProgress = Math.min(currentTime / 30, 1)
        value = 20 + warmupProgress * 75 + Math.sin(currentTime / 5) * 3 + (Math.random() - 0.5) * 2
        break
      case 'pressure_analysis':
        // Simulate oil pressure with RPM variation
        const rpmCycle = Math.sin(currentTime / 8) * 0.5 + 0.5
        value = 25 + rpmCycle * 35 + (Math.random() - 0.5) * 3
        break
      default:
        value = center + (Math.random() - 0.5) * range * 0.8
    }

    return Math.max(0, value)
  }

  const checkObjectives = (value: number) => {
    const [min, max] = config.targetRange
    const inRange = value >= min && value <= max

    // Check specific objectives based on simulation type and current conditions
    config.objectives.forEach(objective => {
      if (completedObjectives.includes(objective)) return

      let shouldComplete = false

      switch (config.type) {
        case 'voltage_measurement':
          if (objective.includes('mesin mati') && value < 13.0 && currentTime > 10) {
            shouldComplete = true
          } else if (objective.includes('mesin hidup') && value > 13.5 && currentTime > 20) {
            shouldComplete = true
          } else if (objective.includes('charging system') && value > 13.8 && value < 14.5) {
            shouldComplete = true
          } else if (objective.includes('masalah') && (value < 12.0 || value > 14.5)) {
            shouldComplete = true
          }
          break
        case 'temperature_monitoring':
          if (objective.includes('warming up') && value > 40 && currentTime > 15) {
            shouldComplete = true
          } else if (objective.includes('operasi normal') && inRange && currentTime > 30) {
            shouldComplete = true
          } else if (objective.includes('overheating') && value > 100) {
            shouldComplete = true
          }
          break
        case 'pressure_analysis':
          if (objective.includes('idle') && value > 20 && currentTime > 10) {
            shouldComplete = true
          } else if (objective.includes('RPM naik') && value > 40 && currentTime > 20) {
            shouldComplete = true
          } else if (objective.includes('normal') && inRange) {
            shouldComplete = true
          }
          break
      }

      if (shouldComplete) {
        setCompletedObjectives(prev => [...prev, objective])
        if (onObjectiveComplete) {
          onObjectiveComplete(objective)
        }
        toast({
          title: "Objektif Tercapai!",
          description: objective,
          variant: "success"
        })
      }
    })
  }

  const startSimulation = () => {
    setIsRunning(true)
    setCurrentTime(0)
    setResults([])
    setCompletedObjectives([])
    toast({
      title: "Simulasi Dimulai",
      description: `Memulai simulasi ${config.type}`,
      variant: "default"
    })
  }

  const pauseSimulation = () => {
    setIsRunning(false)
    toast({
      title: "Simulasi Dijeda",
      description: "Simulasi telah dijeda",
      variant: "default"
    })
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentTime(0)
    setResults([])
    setCompletedObjectives([])
    setCurrentHintIndex(0)
    setShowHint(false)
    toast({
      title: "Simulasi Direset",
      description: "Simulasi telah direset",
      variant: "default"
    })
  }

  const showNextHint = () => {
    if (currentHintIndex < config.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1)
    }
    setShowHint(true)
  }

  const progress = (currentTime / config.duration) * 100
  const objectiveProgress = (completedObjectives.length / config.objectives.length) * 100

  const getSimulationTitle = () => {
    switch (config.type) {
      case 'voltage_measurement': return 'Simulasi Pengukuran Voltase'
      case 'temperature_monitoring': return 'Simulasi Monitoring Suhu'
      case 'pressure_analysis': return 'Simulasi Analisis Tekanan'
      case 'vibration_analysis': return 'Simulasi Analisis Getaran'
      default: return 'Simulasi Interaktif'
    }
  }

  const getParameterUnit = () => {
    switch (config.type) {
      case 'voltage_measurement': return 'V'
      case 'temperature_monitoring': return '°C'
      case 'pressure_analysis': return ' PSI'
      case 'vibration_analysis': return ' Hz'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {getSimulationTitle()}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Durasi: {config.duration} detik | Target: {config.targetRange[0]}-{config.targetRange[1]}{getParameterUnit()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Berjalan" : "Berhenti"}
            </Badge>
            <Badge variant="outline">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={startSimulation} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Mulai
            </Button>
            <Button onClick={pauseSimulation} disabled={!isRunning} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Jeda
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={showNextHint} variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              Hint
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress Simulasi</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Simulation Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Real-time Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            {isRunning ? (
              config.type === 'voltage_measurement' ? (
                <GaugeChart
                  title="Voltase Baterai"
                  unit="V"
                  minValue={10}
                  maxValue={16}
                  thresholds={{ low: 12, medium: 13.5, high: 14.5 }}
                  generateValue={generateSimulationValue}
                  updateInterval={1000}
                />
              ) : (
                <RealTimeLineChart
                  title={getSimulationTitle()}
                  dataKey="simulation"
                  color="#3b82f6"
                  unit={getParameterUnit()}
                  minValue={config.targetRange[0] - 10}
                  maxValue={config.targetRange[1] + 10}
                  generateValue={() => {
                    const value = generateSimulationValue()
                    checkObjectives(value)
                    return value
                  }}
                  updateInterval={1000}
                  maxDataPoints={30}
                />
              )
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Klik "Mulai" untuk memulai simulasi</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Objektif Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress Objektif</span>
                <span>{Math.round(objectiveProgress)}%</span>
              </div>
              <Progress value={objectiveProgress} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              {config.objectives.map((objective, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-sm",
                    completedObjectives.includes(objective) 
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "bg-muted/50"
                  )}
                >
                  {completedObjectives.includes(objective) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={completedObjectives.includes(objective) ? "line-through" : ""}>
                    {objective}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hints */}
      {showHint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Petunjuk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    Petunjuk {currentHintIndex + 1}:
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300 mt-1">
                    {config.hints[currentHintIndex]}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Preset simulation configurations
export const SIMULATION_PRESETS = SIMULATION_CONFIGS
