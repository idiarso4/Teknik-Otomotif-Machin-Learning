// Integration hook that combines all core functionality

import { useCallback, useEffect } from 'react'
import { useSensorData } from './use-sensor-data'
import { useAIDetection } from './use-ai-detection'
import { useLearning } from './use-learning'
import { useArduino } from './use-arduino'
import { useNotifications, useUI } from './use-notifications'
import { useAppStore } from '@/lib/store/app-store'

// Main application integration hook
export function useAppIntegration() {
    const sensorHook = useSensorData()
    const aiHook = useAIDetection()
    const learningHook = useLearning()
    const arduinoHook = useArduino()
    const notificationsHook = useNotifications()
    const uiHook = useUI()

    const { sensors, ai } = useAppStore()

    // Initialize application systems
    const initializeApp = useCallback(async () => {
        try {
            uiHook.showLoading()

            // Load historical sensor data
            await sensorHook.loadHistoricalData(100)

            // Load AI detection results
            await aiHook.loadHistoricalResults(50)

            // Load learning modules
            await learningHook.loadModules()

            // Load Arduino projects
            await arduinoHook.loadProjects()

            // Load user progress
            await learningHook.loadUserProgress('current-user')

            notificationsHook.showSuccess(
                'Aplikasi Siap',
                'Semua sistem telah berhasil dimuat'
            )
        } catch (error) {
            console.error('Failed to initialize app:', error)
            notificationsHook.showError(
                'Gagal Memuat Aplikasi',
                'Terjadi kesalahan saat memuat data aplikasi'
            )
        } finally {
            uiHook.hideLoading()
        }
    }, [sensorHook, aiHook, learningHook, arduinoHook, notificationsHook, uiHook])

    // Start comprehensive simulation
    const startSimulation = useCallback(async () => {
        try {
            // Start sensor simulation
            await sensorHook.startSimulation()

            notificationsHook.showSuccess(
                'Simulasi Dimulai',
                'Simulasi sensor dan AI detection telah aktif'
            )
        } catch (error) {
            console.error('Failed to start simulation:', error)
            notificationsHook.showError(
                'Gagal Memulai Simulasi',
                'Terjadi kesalahan saat memulai simulasi'
            )
        }
    }, [sensorHook, notificationsHook])

    // Stop comprehensive simulation
    const stopSimulation = useCallback(() => {
        try {
            // Stop sensor simulation
            sensorHook.stopSimulation()

            notificationsHook.showInfo(
                'Simulasi Dihentikan',
                'Simulasi sensor telah dihentikan'
            )
        } catch (error) {
            console.error('Failed to stop simulation:', error)
            notificationsHook.showError(
                'Gagal Menghentikan Simulasi',
                'Terjadi kesalahan saat menghentikan simulasi'
            )
        }
    }, [sensorHook, notificationsHook])

    // Export all data
    const exportAllData = useCallback(async () => {
        try {
            uiHook.showLoading()

            // This would implement comprehensive data export
            // For now, we'll show a placeholder notification
            notificationsHook.showInfo(
                'Export Data',
                'Fitur export data akan segera tersedia'
            )
        } catch (error) {
            console.error('Failed to export data:', error)
            notificationsHook.showError(
                'Gagal Export Data',
                'Terjadi kesalahan saat export data'
            )
        } finally {
            uiHook.hideLoading()
        }
    }, [uiHook, notificationsHook])

    // Get application status
    const getAppStatus = useCallback(() => {
        return {
            sensors: {
                isRunning: sensors.isRunning,
                dataCount: sensors.data.length,
                hasCurrentData: !!sensors.currentData
            },
            ai: {
                isAnalyzing: ai.isAnalyzing,
                resultsCount: ai.results.length,
                hasCurrentAnalysis: !!ai.currentAnalysis
            },
            learning: {
                modulesLoaded: learningHook.modules.length,
                currentModule: learningHook.currentModule,
                isLoading: learningHook.isLoading
            },
            arduino: {
                projectsCount: arduinoHook.projects.length,
                hasCurrentProject: !!arduinoHook.currentProject,
                isCompiling: arduinoHook.isCompiling,
                isRunning: arduinoHook.isRunning
            },
            ui: {
                theme: uiHook.theme,
                activeTab: uiHook.activeTab,
                isLoading: uiHook.isLoading,
                notificationsCount: notificationsHook.notifications.length
            }
        }
    }, [
        sensors, ai, learningHook, arduinoHook, uiHook, notificationsHook
    ])

    // Auto-initialize on mount
    useEffect(() => {
        initializeApp()
    }, [initializeApp])

    return {
        // Individual hooks
        sensor: sensorHook,
        ai: aiHook,
        learning: learningHook,
        arduino: arduinoHook,
        notifications: notificationsHook,
        ui: uiHook,

        // Integrated actions
        initializeApp,
        startSimulation,
        stopSimulation,
        exportAllData,
        getAppStatus
    }
}

// Hook for system health monitoring
export function useSystemHealth() {
    const { sensors, ai, arduino } = useAppStore()
    const { showWarning, showError } = useNotifications()

    // Monitor system health
    const checkSystemHealth = useCallback(() => {
        const issues: string[] = []

        // Check sensor system
        if (sensors.isRunning && !sensors.currentData) {
            issues.push('Sensor simulation running but no data received')
        }

        // Check AI system
        if (ai.isAnalyzing && Date.now() - (ai.lastAnalysisTime?.getTime() || 0) > 30000) {
            issues.push('AI analysis taking too long')
        }

        // Check Arduino system
        if (arduino.isCompiling && arduino.isRunning) {
            issues.push('Arduino system in inconsistent state')
        }

        // Show warnings for issues
        if (issues.length > 0) {
            issues.forEach(issue => {
                showWarning('System Health Warning', issue)
            })
        }

        return {
            healthy: issues.length === 0,
            issues
        }
    }, [sensors, ai, arduino, showWarning])

    // Auto health check every 30 seconds
    useEffect(() => {
        const interval = setInterval(checkSystemHealth, 30000)
        return () => clearInterval(interval)
    }, [checkSystemHealth])

    return {
        checkSystemHealth
    }
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
    const { sensors, ai } = useAppStore()
    const { showWarning } = useNotifications()

    // Monitor performance metrics
    const checkPerformance = useCallback(() => {
        // Type assertion for performance.memory (Chrome-specific API)
        const performanceMemory = (performance as any).memory

        const metrics = {
            sensorDataSize: sensors.data.length,
            aiResultsSize: ai.results.length,
            memoryUsage: performanceMemory ? {
                used: performanceMemory.usedJSHeapSize,
                total: performanceMemory.totalJSHeapSize,
                limit: performanceMemory.jsHeapSizeLimit
            } : null
        }

        // Check for performance issues
        if (metrics.sensorDataSize > 5000) {
            showWarning(
                'Performance Warning',
                'Sensor data cache is getting large. Consider clearing old data.'
            )
        }

        if (metrics.memoryUsage && metrics.memoryUsage.used > metrics.memoryUsage.limit * 0.8) {
            showWarning(
                'Memory Warning',
                'Memory usage is high. Consider refreshing the application.'
            )
        }

        return metrics
    }, [sensors, ai, showWarning])

    return {
        checkPerformance
    }
}