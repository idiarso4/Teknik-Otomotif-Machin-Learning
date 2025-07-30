"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"

interface HistogramData {
  range: string
  count: number
  frequency: number
}

interface HistogramChartProps {
  title: string
  unit?: string
  binCount?: number
  minValue?: number
  maxValue?: number
  updateInterval?: number
  sampleSize?: number
  generateValue?: () => number
}

export function HistogramChart({
  title,
  unit = "",
  binCount = 10,
  minValue = 0,
  maxValue = 100,
  updateInterval = 100,
  sampleSize = 1000,
  generateValue
}: HistogramChartProps) {
  const [data, setData] = useState<HistogramData[]>([])
  const [samples, setSamples] = useState<number[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [totalSamples, setTotalSamples] = useState(0)

  // Default value generator for vibration data (normal distribution-like)
  const defaultGenerateValue = () => {
    // Generate vibration-like data with some noise
    const baseFreq = 50 + Math.random() * 20 // Base frequency around 50-70
    const noise = (Math.random() - 0.5) * 10
    const harmonics = Math.sin(Date.now() / 1000) * 5
    return Math.max(minValue, Math.min(maxValue, baseFreq + noise + harmonics))
  }

  const valueGenerator = generateValue || defaultGenerateValue

  // Create histogram bins
  const createHistogram = (values: number[]) => {
    if (values.length === 0) return []

    const binWidth = (maxValue - minValue) / binCount
    const bins: HistogramData[] = []

    for (let i = 0; i < binCount; i++) {
      const binStart = minValue + i * binWidth
      const binEnd = binStart + binWidth
      const binCenter = (binStart + binEnd) / 2

      const count = values.filter(value => 
        value >= binStart && (i === binCount - 1 ? value <= binEnd : value < binEnd)
      ).length

      const frequency = values.length > 0 ? (count / values.length) * 100 : 0

      bins.push({
        range: `${binCenter.toFixed(1)}`,
        count,
        frequency
      })
    }

    return bins
  }

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const newValue = valueGenerator()
      
      setSamples(prevSamples => {
        const newSamples = [...prevSamples, newValue]
        const limitedSamples = newSamples.slice(-sampleSize)
        
        // Update histogram
        const histogram = createHistogram(limitedSamples)
        setData(histogram)
        setTotalSamples(limitedSamples.length)
        
        return limitedSamples
      })
    }, updateInterval)

    return () => clearInterval(interval)
  }, [isRunning, updateInterval, sampleSize, binCount, minValue, maxValue, valueGenerator])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  const resetData = () => {
    setSamples([])
    setData([])
    setTotalSamples(0)
  }

  const getStatistics = () => {
    if (samples.length === 0) return { mean: 0, std: 0, min: 0, max: 0 }

    const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length
    const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length
    const std = Math.sqrt(variance)
    const min = Math.min(...samples)
    const max = Math.max(...samples)

    return { mean, std, min, max }
  }

  const stats = getStatistics()

  const formatTooltipValue = (value: number, name: string) => {
    if (name === "count") return [`${value} samples`, "Count"]
    if (name === "frequency") return [`${value.toFixed(1)}%`, "Frequency"]
    return [value, name]
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRunning}
            className="h-8 w-8 p-0"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetData}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
                label={{ value: `Value (${unit})`, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#3b82f6" 
                name="frequency"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Mean</div>
            <div className="text-lg font-bold">{stats.mean.toFixed(2)}{unit}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Std Dev</div>
            <div className="text-lg font-bold">{stats.std.toFixed(2)}{unit}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Min</div>
            <div className="text-lg font-bold">{stats.min.toFixed(2)}{unit}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Max</div>
            <div className="text-lg font-bold">{stats.max.toFixed(2)}{unit}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Samples: {totalSamples}</span>
          <span>Status: {isRunning ? "Collecting" : "Paused"}</span>
          <span>Bins: {binCount}</span>
        </div>
      </CardContent>
    </Card>
  )
}
