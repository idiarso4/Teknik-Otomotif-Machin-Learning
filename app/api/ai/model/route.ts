// API route untuk AI model configuration

import { NextRequest, NextResponse } from 'next/server'
import { aiDetectionService } from '@/lib/services/ai-fault-detection'
import { AIModel } from '@/lib/types/ai-detection'

export async function GET() {
  try {
    const currentModel = aiDetectionService.getModel()
    
    return NextResponse.json({
      success: true,
      model: currentModel
    })

  } catch (error) {
    console.error('Get AI model API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI model configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { model } = body

    if (!model) {
      return NextResponse.json(
        { error: 'Model configuration is required' },
        { status: 400 }
      )
    }

    // Validate model structure
    if (model.type !== 'RandomForest') {
      return NextResponse.json(
        { error: 'Only RandomForest model type is supported' },
        { status: 400 }
      )
    }

    if (!model.parameters) {
      return NextResponse.json(
        { error: 'Model parameters are required' },
        { status: 400 }
      )
    }

    const { nEstimators, maxDepth, threshold } = model.parameters

    // Validate parameters
    if (typeof nEstimators !== 'number' || nEstimators < 1 || nEstimators > 1000) {
      return NextResponse.json(
        { error: 'nEstimators must be a number between 1 and 1000' },
        { status: 400 }
      )
    }

    if (typeof maxDepth !== 'number' || maxDepth < 1 || maxDepth > 50) {
      return NextResponse.json(
        { error: 'maxDepth must be a number between 1 and 50' },
        { status: 400 }
      )
    }

    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { error: 'threshold must be a number between 0 and 1' },
        { status: 400 }
      )
    }

    // Update AI model
    aiDetectionService.updateModel(model as AIModel)
    const updatedModel = aiDetectionService.getModel()

    return NextResponse.json({
      success: true,
      model: updatedModel,
      message: 'AI model updated successfully'
    })

  } catch (error) {
    console.error('Update AI model API error:', error)
    return NextResponse.json(
      { error: 'Failed to update AI model configuration' },
      { status: 500 }
    )
  }
}