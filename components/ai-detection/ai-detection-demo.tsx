'use client'

// Demo component untuk AI Fault Detection System

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAIDetection } from '@/lib/hooks/use-ai-detection'
import { SensorData } from '@/lib/types/sensor'
import { DetectionResult, DetectionStatus } from '@/lib/types/ai-detection'
import { AlertTriangle, CheckCircle, XCircle, Activity, Zap, Thermometer, Gauge } from 'lucide-react'

export function AIDetectionDemo() {
  const { performAnalysis, isAnalyzing, currentAnalysis, getFaultStatistics } = useAIDetection()
  const [demoData, setDemoData] = useState<SensorData | null>(null)
  const [analysisResults, setAnalysisResults] = useState<DetectionResult[]>([])
  const [statistics, setStatistics] = useState<any>(null)

  // Generate demo sensor data
  const generateDemoData = (scenario: 'normal' | 'warning' | 'critical') => {
    const baseData: SensorData = {
      id: Date.now(),
      engineTemp: 85,
      oilPressure: 2.5,
      batteryVoltage: 12.6,
      engineVibration: 12,
      rpm: 2000,
      timestamp: new Date()
    }

    switch (scenario) {
      case 'warning':
        return {
          ...baseData,
          engineTemp: 95, // Slightly high
          oilPressure: 1.8, // Low
          batteryVoltage: 11.8, // Low
          engineVibration: 18 // High
        }
      case 'critical':
        return {
          ...baseData,
          engineTemp: 115, // Very high
          oilPressure: 0.8, // Very low
          batteryVoltage: 10.5, // Very low
          engineVibration: 35 // Very high
        }
      default:
        return baseData
    }
  }

  // Run AI analysis
  const runAnalysis = async (scenario: 'normal' | 'warning' | 'critical') => {
    const data = generateDemoData(scenario)
    setDemoData(data)

    // Generate some historical data for context
    const historicalData: SensorData[] = Array.from({ length: 10 }, (_, i) => ({
      ...data,
      id: Date.now() - i,
      engineTemp: data.engineTemp + (Math.random() - 0.5) * 5,
      oilPressure: data.oilPressure + (Math.random() - 0.5) * 0.3,
      batteryVoltage: data.batteryVoltage + (Math.random() - 0.5) * 0.5,
      engineVibration: data.engineVibration + (Math.random() - 0.5) * 3,
      timestamp: new Date(Date.now() - i * 1000)
    }))

    try {
      const result = await performAnalysis(data, historicalData)
      if (result) {
        setAnalysisResults(result.parameters)
        setStatistics(getFaultStatistics())
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  // Get status color and icon
  const getStatusDisplay = (status: DetectionStatus) => {
    switch (status) {
      case 'critical':
        return {
          color: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          text: 'KRITIS'
        }
      case 'warning':
        return {
          color: 'secondary' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          text: 'PERINGATAN'
        }
      default:
        return {
          color: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'NORMAL'
        }
    }
  }

  // Get parameter icon
  const getParameterIcon = (parameter: string) => {
    switch (parameter) {
      case 'engine_temp':
        return <Thermometer className="h-4 w-4" />
      case 'oil_pressure':
        return <Gauge className="h-4 w-4" />
      case 'battery_voltage':
        return <Zap className="h-4 w-4" />
      case 'engine_vibration':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  // Get parameter display name
  const getParameterName = (parameter: string) => {
    const names: Record<string, string> = {
      engine_temp: 'Suhu Mesin',
      oil_pressure: 'Tekanan Oli',
      battery_voltage: 'Tegangan Baterai',
      engine_vibration: 'Getaran Mesin'
    }
    return names[parameter] || parameter
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Demo Sistem Deteksi AI
          </CardTitle>
          <CardDescription>
            Demonstrasi sistem deteksi kerusakan otomotif menggunakan algoritma Random Forest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => runAnalysis('normal')} 
              disabled={isAnalyzing}
              variant="outline"
            >
              Test Kondisi Normal
            </Button>
            <Button 
              onClick={() => runAnalysis('warning')} 
              disabled={isAnalyzing}
              variant="outline"
            >
              Test Kondisi Peringatan
            </Button>
            <Button 
              onClick={() => runAnalysis('critical')} 
              disabled={isAnalyzing}
              variant="outline"
            >
              Test Kondisi Kritis
            </Button>
          </div>

          {isAnalyzing && (
            <Alert>
              <Activity className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Sedang menganalisis data sensor menggunakan AI...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {demoData && (
        <Card>
          <CardHeader>
            <CardTitle>Data Sensor Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{demoData.engineTemp}°C</div>
                <div className="text-sm text-muted-foreground">Suhu Mesin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{demoData.oilPressure} bar</div>
                <div className="text-sm text-muted-foreground">Tekanan Oli</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{demoData.batteryVoltage}V</div>
                <div className="text-sm text-muted-foreground">Tegangan Baterai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{demoData.engineVibration}Hz</div>
                <div className="text-sm text-muted-foreground">Getaran Mesin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Analisis AI</CardTitle>
            <CardDescription>
              Deteksi kerusakan berdasarkan algoritma Random Forest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResults.map((result, index) => {
              const statusDisplay = getStatusDisplay(result.status)
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
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
                      <span>Tingkat Kepercayaan</span>
                      <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2" />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="text-sm">
                    <div className="font-medium mb-1">Rekomendasi:</div>
                    <div className="text-muted-foreground">{result.recommendation}</div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Statistik Deteksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.criticalFaults}</div>
                <div className="text-sm text-muted-foreground">Kerusakan Kritis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.warningFaults}</div>
                <div className="text-sm text-muted-foreground">Peringatan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.normalReadings}</div>
                <div className="text-sm text-muted-foreground">Normal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(statistics.averageConfidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Rata-rata Kepercayaan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}