"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAIDetection } from "@/lib/hooks/use-ai-detection"
import { DetectionResult, DetectionStatus } from "@/lib/types/ai-detection"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity,
  Brain,
  Zap,
  Thermometer,
  Gauge,
  RefreshCw,
  Play,
  Pause
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AIResultsPanelProps {
  showControls?: boolean
  maxResults?: number
}

export function AIResultsPanel({ showControls = true, maxResults = 5 }: AIResultsPanelProps) {
  const { 
    currentAnalysis, 
    isAnalyzing, 
    performAnalysis,
    getFaultStatistics 
  } = useAIDetection()
  
  const [autoAnalysis, setAutoAnalysis] = useState(false)
  const [analysisInterval, setAnalysisInterval] = useState<NodeJS.Timeout | null>(null)

  // Auto analysis functionality
  useEffect(() => {
    if (autoAnalysis && !analysisInterval) {
      const interval = setInterval(async () => {
        // Generate sample sensor data for continuous analysis
        const sampleData = {
          id: Date.now(),
          engineTemp: 85 + Math.sin(Date.now() / 10000) * 15 + (Math.random() - 0.5) * 10,
          oilPressure: 45 + Math.cos(Date.now() / 8000) * 10 + (Math.random() - 0.5) * 5,
          batteryVoltage: 12.6 + Math.sin(Date.now() / 15000) * 0.8 + (Math.random() - 0.5) * 0.4,
          engineRPM: 2500 + Math.sin(Date.now() / 12000) * 1000 + (Math.random() - 0.5) * 300,
          engineVibration: 50 + Math.sin(Date.now() / 5000) * 15 + (Math.random() - 0.5) * 8,
          timestamp: new Date()
        }

        try {
          await performAnalysis(sampleData, [])
        } catch (error) {
          console.error('Auto analysis failed:', error)
        }
      }, 5000) // Run every 5 seconds

      setAnalysisInterval(interval)
    } else if (!autoAnalysis && analysisInterval) {
      clearInterval(analysisInterval)
      setAnalysisInterval(null)
    }

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval)
      }
    }
  }, [autoAnalysis, analysisInterval, performAnalysis])

  const getStatusDisplay = (status: DetectionStatus) => {
    switch (status) {
      case 'critical':
        return {
          color: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          text: 'KRITIS',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        }
      case 'warning':
        return {
          color: 'secondary' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'PERINGATAN',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        }
      default:
        return {
          color: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'NORMAL',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        }
    }
  }

  const getParameterIcon = (parameter: string) => {
    switch (parameter.toLowerCase()) {
      case 'enginetemp':
      case 'temperature':
        return <Thermometer className="h-4 w-4" />
      case 'oilpressure':
      case 'pressure':
        return <Gauge className="h-4 w-4" />
      case 'batteryvoltage':
      case 'voltage':
        return <Zap className="h-4 w-4" />
      case 'enginerpm':
      case 'rpm':
        return <Activity className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getParameterName = (parameter: string) => {
    const names: Record<string, string> = {
      'engineTemp': 'Suhu Mesin',
      'oilPressure': 'Tekanan Oli',
      'batteryVoltage': 'Voltase Baterai',
      'engineRPM': 'RPM Mesin',
      'engineVibration': 'Getaran Mesin'
    }
    return names[parameter] || parameter
  }

  const runManualAnalysis = async () => {
    const sampleData = {
      id: Date.now(),
      engineTemp: 95 + Math.random() * 10, // Higher temp for demo
      oilPressure: 30 + Math.random() * 10, // Lower pressure for demo
      batteryVoltage: 11.8 + Math.random() * 0.5, // Lower voltage for demo
      engineRPM: 3500 + Math.random() * 500,
      engineVibration: 65 + Math.random() * 10, // Higher vibration for demo
      timestamp: new Date()
    }

    try {
      await performAnalysis(sampleData, [])
    } catch (error) {
      console.error('Manual analysis failed:', error)
    }
  }

  const toggleAutoAnalysis = () => {
    setAutoAnalysis(!autoAnalysis)
  }

  const displayResults = currentAnalysis?.slice(0, maxResults) || []
  const statistics = getFaultStatistics()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Hasil Deteksi AI
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis kesalahan sistem menggunakan Random Forest
          </p>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runManualAnalysis}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isAnalyzing && "animate-spin")} />
              Analisis Manual
            </Button>
            <Button
              variant={autoAnalysis ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoAnalysis}
            >
              {autoAnalysis ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {autoAnalysis ? "Stop Auto" : "Auto Analisis"}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.criticalFaults}</div>
              <div className="text-xs text-muted-foreground">Kritis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.warningFaults}</div>
              <div className="text-xs text-muted-foreground">Peringatan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.normalReadings}</div>
              <div className="text-xs text-muted-foreground">Normal</div>
            </div>
          </div>
        )}

        {/* Analysis Status */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Sedang menganalisis data sensor...
            </span>
          </div>
        )}

        {/* Detection Results */}
        {displayResults.length > 0 ? (
          <div className="space-y-3">
            {displayResults.map((result, index) => {
              const statusDisplay = getStatusDisplay(result.status)
              return (
                <div 
                  key={index} 
                  className={cn(
                    "border rounded-lg p-4 transition-all duration-200",
                    statusDisplay.borderColor,
                    statusDisplay.bgColor
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getParameterIcon(result.parameter)}
                      <span className="font-medium">{getParameterName(result.parameter)}</span>
                    </div>
                    <Badge variant={statusDisplay.color} className="flex items-center gap-1">
                      {statusDisplay.icon}
                      {statusDisplay.text}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tingkat Kepercayaan</span>
                      <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={result.confidence * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1 text-muted-foreground">Rekomendasi:</div>
                    <div className="text-foreground">{result.recommendation}</div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Dianalisis: {result.timestamp.toLocaleString('id-ID')}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada hasil analisis</p>
            <p className="text-sm">Klik "Analisis Manual" atau aktifkan "Auto Analisis" untuk memulai</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
