"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAIDetection } from "@/lib/hooks/use-ai-detection"
import { DetectionStatus } from "@/lib/types/ai-detection"
import { AlertTriangle, TrendingUp, PieChart as PieChartIcon } from "lucide-react"

interface SeverityData {
  name: string
  value: number
  color: string
  percentage: number
}

interface TrendData {
  time: string
  critical: number
  warning: number
  normal: number
}

export function FaultSeverityChart() {
  const { results, getFaultStatistics } = useAIDetection()
  const [severityData, setSeverityData] = useState<SeverityData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [totalDetections, setTotalDetections] = useState(0)

  useEffect(() => {
    const statistics = getFaultStatistics()
    const total = statistics.criticalFaults + statistics.warningFaults + statistics.normalReadings

    if (total > 0) {
      const data: SeverityData[] = [
        {
          name: 'Kritis',
          value: statistics.criticalFaults,
          color: '#ef4444',
          percentage: Math.round((statistics.criticalFaults / total) * 100)
        },
        {
          name: 'Peringatan',
          value: statistics.warningFaults,
          color: '#f59e0b',
          percentage: Math.round((statistics.warningFaults / total) * 100)
        },
        {
          name: 'Normal',
          value: statistics.normalReadings,
          color: '#10b981',
          percentage: Math.round((statistics.normalReadings / total) * 100)
        }
      ]

      setSeverityData(data)
      setTotalDetections(total)
    }

    // Generate trend data from recent results
    const recentResults = results.slice(0, 20).reverse()
    const trendPoints: TrendData[] = []
    
    for (let i = 0; i < recentResults.length; i += 4) {
      const batch = recentResults.slice(i, i + 4)
      const critical = batch.filter(r => r.status === 'critical').length
      const warning = batch.filter(r => r.status === 'warning').length
      const normal = batch.filter(r => r.status === 'normal').length
      
      trendPoints.push({
        time: `T-${Math.floor((recentResults.length - i) / 4)}`,
        critical,
        warning,
        normal
      })
    }

    setTrendData(trendPoints.reverse())
  }, [results, getFaultStatistics])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show label for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{`Waktu: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value} deteksi`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getSeverityLevel = () => {
    if (totalDetections === 0) return { level: 'unknown', color: 'gray', text: 'Tidak Ada Data' }
    
    const criticalPercentage = severityData.find(d => d.name === 'Kritis')?.percentage || 0
    const warningPercentage = severityData.find(d => d.name === 'Peringatan')?.percentage || 0
    
    if (criticalPercentage > 20) {
      return { level: 'high', color: 'red', text: 'Tingkat Keparahan Tinggi' }
    } else if (criticalPercentage > 10 || warningPercentage > 40) {
      return { level: 'medium', color: 'yellow', text: 'Tingkat Keparahan Sedang' }
    } else {
      return { level: 'low', color: 'green', text: 'Tingkat Keparahan Rendah' }
    }
  }

  const severityLevel = getSeverityLevel()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pie Chart - Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribusi Tingkat Keparahan
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total {totalDetections} deteksi
            </p>
          </div>
          <Badge 
            variant={severityLevel.level === 'high' ? 'destructive' : 
                    severityLevel.level === 'medium' ? 'secondary' : 'default'}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            {severityLevel.text}
          </Badge>
        </CardHeader>
        <CardContent>
          {severityData.length > 0 ? (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value} deteksi`, name]}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                {severityData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data untuk ditampilkan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tren Tingkat Keparahan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Perubahan tingkat keparahan dari waktu ke waktu
          </p>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="critical" 
                    stackId="a" 
                    fill="#ef4444" 
                    name="Kritis"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="warning" 
                    stackId="a" 
                    fill="#f59e0b" 
                    name="Peringatan"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="normal" 
                    stackId="a" 
                    fill="#10b981" 
                    name="Normal"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada data tren untuk ditampilkan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
