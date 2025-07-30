"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GaugeChartProps {
  title: string
  value?: number
  minValue?: number
  maxValue?: number
  unit?: string
  thresholds?: {
    low: number
    medium: number
    high: number
  }
  colors?: {
    low: string
    medium: string
    high: string
    background: string
  }
  updateInterval?: number
  generateValue?: () => number
}

export function GaugeChart({
  title,
  value,
  minValue = 0,
  maxValue = 100,
  unit = "",
  thresholds = { low: 30, medium: 70, high: 90 },
  colors = {
    low: "#22c55e",
    medium: "#eab308", 
    high: "#ef4444",
    background: "#f1f5f9"
  },
  updateInterval = 1000,
  generateValue
}: GaugeChartProps) {
  const [currentValue, setCurrentValue] = useState(value || 0)

  // Default value generator if none provided and no value prop
  const defaultGenerateValue = () => {
    const baseValue = (minValue + maxValue) / 2
    const variation = (maxValue - minValue) * 0.2
    return Math.max(minValue, Math.min(maxValue, baseValue + (Math.random() - 0.5) * variation))
  }

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value)
      return
    }

    if (!generateValue) return

    const interval = setInterval(() => {
      setCurrentValue(generateValue())
    }, updateInterval)

    return () => clearInterval(interval)
  }, [value, generateValue, updateInterval])

  // Calculate percentage and determine color
  const percentage = ((currentValue - minValue) / (maxValue - minValue)) * 100
  const normalizedValue = Math.max(0, Math.min(100, percentage))

  const getStatusColor = () => {
    if (normalizedValue <= (thresholds.low / maxValue) * 100) return colors.low
    if (normalizedValue <= (thresholds.medium / maxValue) * 100) return colors.medium
    return colors.high
  }

  const getStatusText = () => {
    if (normalizedValue <= (thresholds.low / maxValue) * 100) return "Normal"
    if (normalizedValue <= (thresholds.medium / maxValue) * 100) return "Warning"
    return "Critical"
  }

  // Create gauge data
  const gaugeData = [
    { name: "value", value: normalizedValue },
    { name: "remaining", value: 100 - normalizedValue }
  ]

  const statusColor = getStatusColor()
  const statusText = getStatusText()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Cell fill={statusColor} />
                  <Cell fill={colors.background} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Center value display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold" style={{ color: statusColor }}>
              {currentValue.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">{unit}</div>
          </div>
        </div>

        {/* Status and range info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span 
              className={cn("text-sm font-medium px-2 py-1 rounded-full", {
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100": statusText === "Normal",
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100": statusText === "Warning",
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100": statusText === "Critical"
              })}
            >
              {statusText}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Min: {minValue}{unit}</span>
            <span>Max: {maxValue}{unit}</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${normalizedValue}%`,
                backgroundColor: statusColor
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
