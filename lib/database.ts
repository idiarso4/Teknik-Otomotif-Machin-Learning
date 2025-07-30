// Database connection dan utilities untuk Prisma

import { PrismaClient } from '@prisma/client'

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utilities
export class DatabaseService {
  // Sensor data operations
  static async saveSensorData(data: {
    engineTemp: number
    oilPressure: number
    batteryVoltage: number
    engineVibration: number
    rpm: number
  }) {
    return await prisma.sensorReading.create({
      data: {
        engineTemp: data.engineTemp,
        oilPressure: data.oilPressure,
        batteryVoltage: data.batteryVoltage,
        engineVibration: data.engineVibration,
        rpm: data.rpm
      }
    })
  }

  static async getSensorData(limit: number = 100) {
    return await prisma.sensorReading.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  static async getSensorDataByTimeRange(startTime: Date, endTime: Date) {
    return await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      },
      orderBy: { timestamp: 'desc' }
    })
  }

  // AI detection operations
  static async saveAIDetection(data: {
    parameter: string
    confidence: number
    status: string
    recommendation: string
  }) {
    return await prisma.aIDetection.create({
      data: {
        parameter: data.parameter,
        confidence: data.confidence,
        status: data.status,
        recommendation: data.recommendation
      }
    })
  }

  static async getAIDetections(limit: number = 50, parameter?: string) {
    return await prisma.aIDetection.findMany({
      where: parameter ? { parameter } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  // User progress operations
  static async saveUserProgress(data: {
    moduleId: string
    userSession: string
    completionPercentage: number
    quizScores: string
  }) {
    return await prisma.userProgress.upsert({
      where: {
        moduleId_userSession: {
          moduleId: data.moduleId,
          userSession: data.userSession
        }
      },
      update: {
        completionPercentage: data.completionPercentage,
        quizScores: data.quizScores,
        lastAccessed: new Date()
      },
      create: {
        moduleId: data.moduleId,
        userSession: data.userSession,
        completionPercentage: data.completionPercentage,
        quizScores: data.quizScores
      }
    })
  }

  static async getUserProgress(userSession: string) {
    return await prisma.userProgress.findMany({
      where: { userSession },
      orderBy: { lastAccessed: 'desc' }
    })
  }

  // Arduino project operations
  static async saveArduinoProject(data: {
    name: string
    code: string
    pinConfig: string
  }) {
    return await prisma.arduinoProject.create({
      data: {
        name: data.name,
        code: data.code,
        pinConfig: data.pinConfig
      }
    })
  }

  static async updateArduinoProject(id: number, data: {
    name?: string
    code?: string
    pinConfig?: string
  }) {
    return await prisma.arduinoProject.update({
      where: { id },
      data: {
        ...data,
        modifiedAt: new Date()
      }
    })
  }

  static async getArduinoProjects() {
    return await prisma.arduinoProject.findMany({
      orderBy: { modifiedAt: 'desc' }
    })
  }

  static async deleteArduinoProject(id: number) {
    return await prisma.arduinoProject.delete({
      where: { id }
    })
  }

  // System configuration operations
  static async getSystemConfig(key: string) {
    return await prisma.systemConfig.findUnique({
      where: { configKey: key }
    })
  }

  static async setSystemConfig(key: string, value: string, description?: string) {
    return await prisma.systemConfig.upsert({
      where: { configKey: key },
      update: {
        configValue: value,
        description: description
      },
      create: {
        configKey: key,
        configValue: value,
        description: description
      }
    })
  }

  // Data cleanup operations
  static async cleanupOldSensorData(daysToKeep: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return await prisma.sensorReading.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })
  }

  static async cleanupOldAIDetections(daysToKeep: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    return await prisma.aIDetection.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    })
  }
}