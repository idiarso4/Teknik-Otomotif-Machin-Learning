// API route untuk AI detection statistics

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { aiDetectionService } from '@/lib/services/ai-fault-detection'
import { DetectionResult, DetectionStatus } from '@/lib/types/ai-detection'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const parameter = searchParams.get('parameter')
    const status = searchParams.get('status') as DetectionStatus | null
    const days = parseInt(searchParams.get('days') || '7')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Get historical data from database
    const data = await DatabaseService.getAIDetections(limit, parameter || undefined)
    
    // Filter by date range and status if specified
    const filteredData = data.filter((item: any) => {
      const itemDate = new Date(item.timestamp)
      const inDateRange = itemDate >= startDate && itemDate <= endDate
      const matchesStatus = !status || item.status === status
      return inDateRange && matchesStatus
    })

    const results: DetectionResult[] = filteredData.map((item: any) => ({
      id: item.id,
      parameter: item.parameter,
      confidence: item.confidence,
      status: item.status,
      recommendation: item.recommendation,
      timestamp: item.timestamp
    }))

    // Calculate statistics using the service
    const statistics = aiDetectionService.getFaultStatistics(results)

    // Calculate additional time-based statistics
    const timeStats = calculateTimeBasedStats(results, days)
    
    // Calculate parameter-specific trends
    const parameterTrends = calculateParameterTrends(results)

    return NextResponse.json({
      success: true,
      statistics: {
        ...statistics,
        ...timeStats,
        parameterTrends
      },
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      },
      totalRecords: results.length
    })

  } catch (error) {
    console.error('AI statistics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI detection statistics' },
      { status: 500 }
    )
  }
}

// Calculate time-based statistics
function calculateTimeBasedStats(results: DetectionResult[], days: number) {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  
  const dailyStats = []
  
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(now.getTime() - (i + 1) * dayMs)
    const dayEnd = new Date(now.getTime() - i * dayMs)
    
    const dayResults = results.filter(r => {
      const resultDate = new Date(r.timestamp)
      return resultDate >= dayStart && resultDate < dayEnd
    })
    
    const dayStats = aiDetectionService.getFaultStatistics(dayResults)
    
    dailyStats.unshift({
      date: dayStart.toISOString().split('T')[0],
      ...dayStats
    })
  }
  
  return {
    dailyStats,
    averageFaultsPerDay: dailyStats.reduce((sum, day) => sum + day.totalFaults, 0) / days,
    trendDirection: calculateTrendDirection(dailyStats)
  }
}

// Calculate parameter-specific trends
function calculateParameterTrends(results: DetectionResult[]) {
  const parameters = ['engine_temp', 'oil_pressure', 'battery_voltage', 'engine_vibration']
  const trends: Record<string, any> = {}
  
  for (const param of parameters) {
    const paramResults = results.filter(r => r.parameter === param)
    
    if (paramResults.length === 0) {
      trends[param] = { trend: 'stable', confidence: 0, recentFaults: 0 }
      continue
    }
    
    // Sort by timestamp
    paramResults.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    // Calculate recent fault rate (last 24 hours vs previous 24 hours)
    const now = new Date()
    const last24h = paramResults.filter(r => 
      new Date(r.timestamp).getTime() > now.getTime() - 24 * 60 * 60 * 1000
    )
    const prev24h = paramResults.filter(r => {
      const time = new Date(r.timestamp).getTime()
      return time > now.getTime() - 48 * 60 * 60 * 1000 && 
             time <= now.getTime() - 24 * 60 * 60 * 1000
    })
    
    const recentFaults = last24h.filter(r => r.status !== 'normal').length
    const prevFaults = prev24h.filter(r => r.status !== 'normal').length
    
    let trend = 'stable'
    if (recentFaults > prevFaults * 1.2) {
      trend = 'increasing'
    } else if (recentFaults < prevFaults * 0.8) {
      trend = 'decreasing'
    }
    
    const avgConfidence = paramResults.reduce((sum, r) => sum + r.confidence, 0) / paramResults.length
    
    trends[param] = {
      trend,
      confidence: Math.round(avgConfidence * 100) / 100,
      recentFaults,
      totalDetections: paramResults.length,
      criticalCount: paramResults.filter(r => r.status === 'critical').length,
      warningCount: paramResults.filter(r => r.status === 'warning').length
    }
  }
  
  return trends
}

// Calculate overall trend direction
function calculateTrendDirection(dailyStats: any[]) {
  if (dailyStats.length < 3) return 'insufficient_data'
  
  const recentDays = dailyStats.slice(-3)
  const earlierDays = dailyStats.slice(0, 3)
  
  const recentAvg = recentDays.reduce((sum, day) => sum + day.totalFaults, 0) / recentDays.length
  const earlierAvg = earlierDays.reduce((sum, day) => sum + day.totalFaults, 0) / earlierDays.length
  
  if (recentAvg > earlierAvg * 1.2) return 'increasing'
  if (recentAvg < earlierAvg * 0.8) return 'decreasing'
  return 'stable'
}