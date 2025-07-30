"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface DataPoint {
  timestamp: string
  value: number
  time: number
}

interface RealTimeLineChartProps {
  title: string
  dataKey: string
  color?: string
  unit?: string
  minValue?: number
  maxValue?: number
  updateInterval?: number
  maxDataPoints?: number
  generateValue?: () => number
}

export function RealTimeLineChart({
  title,
  dataKey,
  color = "#3b82f6",
  unit = "",
  minValue = 0,
  maxValue = 100,
  updateInterval = 1000,
  maxDataPoints = 50,
  generateValue
}: RealTimeLineChartProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isRunning, setIsRunning] = useState(true)

  // Default value generator if none provided
  const defaultGenerateValue = () => {
    const baseValue = (minValue + maxValue) / 2
    const variation = (maxValue - minValue) * 0.1
    return baseValue + (Math.random() - 0.5) * variation
  }

  const valueGenerator = generateValue || defaultGenerateValue

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const now = new Date()
      const newDataPoint: DataPoint = {
        timestamp: now.toLocaleTimeString(),
        value: valueGenerator(),
        time: now.getTime()
      }

      setData(prevData => {
        const newData = [...prevData, newDataPoint]
        return newData.slice(-maxDataPoints)
      })
    }, updateInterval)

    return () => clearInterval(interval)
  }, [isRunning, updateInterval, maxDataPoints, valueGenerator])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  const resetData = () => {
    setData([])
  }

  const formatTooltipValue = (value: number) => {
    return [`${value.toFixed(2)}${unit}`, dataKey]
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}${unit}`}
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
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                name={`${title} (${unit})`}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Data Points: {data.length}</span>
          <span>Status: {isRunning ? "Running" : "Paused"}</span>
          <span>
            Latest: {data.length > 0 ? `${data[data.length - 1].value.toFixed(2)}${unit}` : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
