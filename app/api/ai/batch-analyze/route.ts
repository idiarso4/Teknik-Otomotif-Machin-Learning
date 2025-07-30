// API route untuk batch AI analysis

import { NextRequest, NextResponse } from 'next/server'
import { aiDetectionService } from '@/lib/services/ai-fault-detection'
import { SensorData } from '@/lib/types/sensor'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataPoints, saveResults = false } = body

    if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
      return NextResponse.json(
        { error: 'Data points array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each data point
    const requiredFields = ['engineTemp', 'oilPressure', 'batteryVoltage', 'engineVibration', 'engineRPM']
    for (let i = 0; i < dataPoints.length; i++) {
      const dataPoint = dataPoints[i]
      for (const field of requiredFields) {
        if (typeof dataPoint[field] !== 'number') {
          return NextResponse.json(
            { error: `Invalid or missing field '${field}' in data point ${i}` },
            { status: 400 }
          )
        }
      }
    }

    // Perform batch analysis
    const batchResults = await aiDetectionService.batchAnalyze(dataPoints as SensorData[])

    // Optionally save results to database
    if (saveResults) {
      for (const results of batchResults) {
        for (const result of results) {
          await DatabaseService.saveAIDetection({
            parameter: result.parameter,
            confidence: result.confidence,
            status: result.status,
            recommendation: result.recommendation
          })
        }
      }
    }

    // Calculate batch statistics
    const allResults = batchResults.flat()
    const statistics = aiDetectionService.getFaultStatistics(allResults)

    return NextResponse.json({
      success: true,
      batchResults,
      statistics,
      totalDataPoints: dataPoints.length,
      totalDetections: allResults.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Batch AI analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during batch AI analysis' },
      { status: 500 }
    )
  }
}