"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Thermometer,
  Gauge,
  Zap,
  Wrench
} from "lucide-react"

export type StatusLevel = "normal" | "warning" | "critical" | "offline"

interface StatusIndicatorProps {
  title: string
  value: number
  unit?: string
  status: StatusLevel
  icon?: React.ReactNode
  description?: string
  lastUpdated?: Date
}

interface SystemStatusProps {
  indicators: StatusIndicatorProps[]
  title?: string
}

const statusConfig = {
  normal: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle,
    label: "Normal"
  },
  warning: {
    color: "text-yellow-600 dark:text-yellow-400", 
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: AlertTriangle,
    label: "Warning"
  },
  critical: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20", 
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
    label: "Critical"
  },
  offline: {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800", 
    icon: XCircle,
    label: "Offline"
  }
}

export function StatusIndicator({ 
  title, 
  value, 
  unit = "", 
  status, 
  icon, 
  description,
  lastUpdated 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className={cn("transition-all duration-200", config.borderColor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {icon || <Activity className="h-4 w-4 text-muted-foreground" />}
          <StatusIcon className={cn("h-4 w-4", config.color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {value.toFixed(1)}{unit}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className={cn(config.bgColor, config.color, "border", config.borderColor)}
          >
            {config.label}
          </Badge>
        </div>
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-2">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SystemStatus({ indicators, title = "System Status" }: SystemStatusProps) {
  const [overallStatus, setOverallStatus] = useState<StatusLevel>("normal")

  useEffect(() => {
    // Determine overall system status
    const statuses = indicators.map(i => i.status)
    
    if (statuses.includes("critical")) {
      setOverallStatus("critical")
    } else if (statuses.includes("warning")) {
      setOverallStatus("warning")
    } else if (statuses.includes("offline")) {
      setOverallStatus("offline")
    } else {
      setOverallStatus("normal")
    }
  }, [indicators])

  const statusCounts = {
    normal: indicators.filter(i => i.status === "normal").length,
    warning: indicators.filter(i => i.status === "warning").length,
    critical: indicators.filter(i => i.status === "critical").length,
    offline: indicators.filter(i => i.status === "offline").length
  }

  const config = statusConfig[overallStatus]
  const StatusIcon = config.icon

  return (
    <div className="space-y-4">
      {/* Overall Status Header */}
      <Card className={cn("transition-all duration-200", config.borderColor)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn("h-5 w-5", config.color)} />
              <Badge 
                variant="secondary"
                className={cn(config.bgColor, config.color, "border", config.borderColor)}
              >
                {config.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.normal}</div>
              <div className="text-xs text-muted-foreground">Normal</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.warning}</div>
              <div className="text-xs text-muted-foreground">Warning</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{statusCounts.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{statusCounts.offline}</div>
              <div className="text-xs text-muted-foreground">Offline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Status Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {indicators.map((indicator, index) => (
          <StatusIndicator key={index} {...indicator} />
        ))}
      </div>
    </div>
  )
}

// Predefined automotive sensor status indicators
export function AutomotiveStatusIndicators() {
  const [indicators, setIndicators] = useState<StatusIndicatorProps[]>([
    {
      title: "Engine Temperature",
      value: 85,
      unit: "°C",
      status: "normal",
      icon: <Thermometer className="h-4 w-4" />,
      description: "Operating within normal range",
      lastUpdated: new Date()
    },
    {
      title: "Oil Pressure", 
      value: 45,
      unit: " PSI",
      status: "normal",
      icon: <Gauge className="h-4 w-4" />,
      description: "Pressure stable",
      lastUpdated: new Date()
    },
    {
      title: "Battery Voltage",
      value: 12.6,
      unit: "V", 
      status: "normal",
      icon: <Zap className="h-4 w-4" />,
      description: "Charging system OK",
      lastUpdated: new Date()
    },
    {
      title: "Engine RPM",
      value: 2500,
      unit: " RPM",
      status: "normal", 
      icon: <Activity className="h-4 w-4" />,
      description: "Engine running smoothly",
      lastUpdated: new Date()
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIndicators(prev => prev.map(indicator => {
        let newValue = indicator.value
        let newStatus: StatusLevel = "normal"

        // Simulate different sensor behaviors
        switch (indicator.title) {
          case "Engine Temperature":
            newValue = 80 + Math.random() * 20
            newStatus = newValue > 95 ? "critical" : newValue > 90 ? "warning" : "normal"
            break
          case "Oil Pressure":
            newValue = 40 + Math.random() * 15
            newStatus = newValue < 30 ? "critical" : newValue < 35 ? "warning" : "normal"
            break
          case "Battery Voltage":
            newValue = 12.2 + Math.random() * 0.8
            newStatus = newValue < 12.0 ? "critical" : newValue < 12.3 ? "warning" : "normal"
            break
          case "Engine RPM":
            newValue = 2000 + Math.random() * 1000
            newStatus = newValue > 4000 ? "warning" : "normal"
            break
        }

        return {
          ...indicator,
          value: newValue,
          status: newStatus,
          lastUpdated: new Date()
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return <SystemStatus indicators={indicators} title="Automotive System Status" />
}
