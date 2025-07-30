// API route untuk AI analysis

import { NextRequest, NextResponse } from 'next/server'
import { aiDetectionService } from '@/lib/services/ai-fault-detection'
import { SensorData } from '@/lib/types/sensor'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentData, historicalData = [] } = body

    if (!currentData) {
      return NextResponse.json(
        { error: 'Current sensor data is required' },
        { status: 400 }
      )
    }

    // Validate sensor data structure
    const requiredFields = ['engineTemp', 'oilPressure', 'batteryVoltage', 'engineVibration', 'engineRPM']
    for (const field of requiredFields) {
      if (typeof currentData[field] !== 'number') {
        return NextResponse.json(
          { error: `Invalid or missing field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Perform AI analysis
    const results = await aiDetectionService.analyzeSensorData(
      currentData as SensorData,
      historicalData as SensorData[]
    )

    // Save results to database
    for (const result of results) {
      await DatabaseService.saveAIDetection({
        parameter: result.parameter,
        confidence: result.confidence,
        status: result.status,
        recommendation: result.recommendation
      })
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI analysis API error:', error)
    return NextResponse.json(
      { error: 'Internal server error during AI analysis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const parameter = searchParams.get('parameter')

    // Get historical AI detection results
    const data = await DatabaseService.getAIDetections(limit, parameter || undefined)
    
    const results = data.map((item: any) => ({
      id: item.id,
      parameter: item.parameter,
      confidence: item.confidence,
      status: item.status,
      recommendation: item.recommendation,
      timestamp: item.timestamp
    }))

    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })

  } catch (error) {
    console.error('AI results API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI detection results' },
      { status: 500 }
    )
  }
}