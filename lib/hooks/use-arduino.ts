// Custom hooks untuk Arduino IDE simulator

import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store/app-store'
import { ArduinoProject, PinConfig, CompileResult, ARDUINO_BOARDS, ARDUINO_TEMPLATES } from '@/lib/types/arduino'
import { DatabaseService } from '@/lib/database'

// Hook untuk Arduino project management
export function useArduino() {
  const {
    arduino,
    setArduinoProjects,
    setCurrentProject,
    updateCurrentProject,
    addSerialMessage,
    clearSerialMonitor,
    setCompiling,
    setRunning
  } = useAppStore()

  const serialIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load Arduino projects from database
  const loadProjects = useCallback(async () => {
    try {
      const data = await DatabaseService.getArduinoProjects()
      const projects: ArduinoProject[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        pinConfig: JSON.parse(item.pinConfig),
        createdAt: item.createdAt,
        modifiedAt: item.modifiedAt
      }))
      setArduinoProjects(projects)
      return projects
    } catch (error) {
      console.error('Failed to load Arduino projects:', error)
      return []
    }
  }, [setArduinoProjects])

  // Create new project
  const createProject = useCallback(async (name: string, template?: keyof typeof ARDUINO_TEMPLATES) => {
    try {
      const code = template ? ARDUINO_TEMPLATES[template] : `
// Proyek Arduino Baru
void setup() {
  Serial.begin(9600);
  Serial.println("Arduino siap!");
}

void loop() {
  // Kode utama di sini
  delay(1000);
}
`
      const pinConfig: PinConfig[] = [
        { pin: 13, mode: 'OUTPUT', value: 0, connected: false, label: 'LED Built-in' }
      ]

      const savedProject = await DatabaseService.saveArduinoProject({
        name,
        code: code.trim(),
        pinConfig: JSON.stringify(pinConfig)
      })

      const newProject: ArduinoProject = {
        id: savedProject.id,
        name: savedProject.name,
        code: savedProject.code,
        pinConfig: JSON.parse(savedProject.pinConfig),
        createdAt: savedProject.createdAt,
        modifiedAt: savedProject.modifiedAt
      }

      // Reload projects to update list
      await loadProjects()
      setCurrentProject(newProject)
      
      return newProject
    } catch (error) {
      console.error('Failed to create Arduino project:', error)
      throw error
    }
  }, [loadProjects, setCurrentProject])

  // Save current project
  const saveProject = useCallback(async () => {
    if (!arduino.currentProject || !arduino.currentProject.id) {
      throw new Error('No project to save')
    }

    try {
      await DatabaseService.updateArduinoProject(arduino.currentProject.id, {
        name: arduino.currentProject.name,
        code: arduino.currentProject.code,
        pinConfig: JSON.stringify(arduino.currentProject.pinConfig)
      })

      // Reload projects to update list
      await loadProjects()
      
      addSerialMessage({
        timestamp: new Date(),
        message: `Proyek "${arduino.currentProject.name}" berhasil disimpan`,
        type: 'output'
      })
    } catch (error) {
      console.error('Failed to save Arduino project:', error)
      addSerialMessage({
        timestamp: new Date(),
        message: `Error: Gagal menyimpan proyek - ${error}`,
        type: 'error'
      })
      throw error
    }
  }, [arduino.currentProject, loadProjects, addSerialMessage])

  // Delete project
  const deleteProject = useCallback(async (projectId: number) => {
    try {
      await DatabaseService.deleteArduinoProject(projectId)
      await loadProjects()
      
      // If deleted project was current, clear current project
      if (arduino.currentProject?.id === projectId) {
        setCurrentProject(null)
      }
    } catch (error) {
      console.error('Failed to delete Arduino project:', error)
      throw error
    }
  }, [arduino.currentProject, loadProjects, setCurrentProject])

  // Simulate code compilation
  const compileCode = useCallback(async (code: string): Promise<CompileResult> => {
    setCompiling(true)
    
    try {
      // Simulate compilation delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const errors: any[] = []
      const warnings: any[] = []
      
      // Basic syntax checking
      const lines = code.split('\n')
      lines.forEach((line, index) => {
        const lineNum = index + 1
        
        // Check for common syntax errors
        if (line.includes('void setup()') && !line.includes('{') && !lines[index + 1]?.includes('{')) {
          errors.push({
            line: lineNum,
            column: line.length,
            message: 'Expected "{" after function declaration',
            severity: 'error'
          })
        }
        
        if (line.includes('Serial.begin') && !line.includes(';')) {
          errors.push({
            line: lineNum,
            column: line.length,
            message: 'Expected ";" at end of statement',
            severity: 'error'
          })
        }
        
        // Check for warnings
        if (line.includes('delay(') && line.includes('delay(0)')) {
          warnings.push({
            line: lineNum,
            column: line.indexOf('delay'),
            message: 'delay(0) has no effect'
          })
        }
      })
      
      // Calculate memory usage (simulated)
      const codeLength = code.length
      const programUsage = Math.min(32256, Math.max(1000, codeLength * 2))
      const dataUsage = Math.min(2048, Math.max(200, codeLength * 0.1))
      
      const result: CompileResult = {
        success: errors.length === 0,
        errors,
        warnings,
        memoryUsage: {
          program: programUsage,
          data: dataUsage,
          programMax: 32256, // Arduino Uno flash memory
          dataMax: 2048      // Arduino Uno SRAM
        }
      }
      
      // Add compilation messages to serial monitor
      if (result.success) {
        addSerialMessage({
          timestamp: new Date(),
          message: `Kompilasi berhasil! Program: ${programUsage} bytes, Data: ${dataUsage} bytes`,
          type: 'output'
        })
      } else {
        addSerialMessage({
          timestamp: new Date(),
          message: `Kompilasi gagal: ${errors.length} error(s) ditemukan`,
          type: 'error'
        })
        errors.forEach(error => {
          addSerialMessage({
            timestamp: new Date(),
            message: `Line ${error.line}: ${error.message}`,
            type: 'error'
          })
        })
      }
      
      return result
    } catch (error) {
      addSerialMessage({
        timestamp: new Date(),
        message: `Error kompilasi: ${error}`,
        type: 'error'
      })
      throw error
    } finally {
      setCompiling(false)
    }
  }, [setCompiling, addSerialMessage])

  // Simulate code execution
  const runCode = useCallback(async (code: string) => {
    if (arduino.isRunning) {
      stopExecution()
      return
    }

    // First compile the code
    const compileResult = await compileCode(code)
    if (!compileResult.success) {
      return
    }

    setRunning(true)
    addSerialMessage({
      timestamp: new Date(),
      message: 'Memulai eksekusi kode...',
      type: 'output'
    })

    // Simulate setup() function
    addSerialMessage({
      timestamp: new Date(),
      message: 'Menjalankan setup()...',
      type: 'output'
    })

    // Simulate serial output based on code content
    serialIntervalRef.current = setInterval(() => {
      if (code.includes('Serial.println')) {
        // Extract Serial.println statements and simulate their output
        const lines = code.split('\n')
        const serialLines = lines.filter(line => 
          line.includes('Serial.println') || line.includes('Serial.print')
        )
        
        if (serialLines.length > 0) {
          const randomLine = serialLines[Math.floor(Math.random() * serialLines.length)]
          let output = 'Output simulasi'
          
          // Try to extract the actual output
          const match = randomLine.match(/Serial\.print(?:ln)?\s*\(\s*["']([^"']+)["']\s*\)/)
          if (match) {
            output = match[1]
          } else if (randomLine.includes('temperature')) {
            output = `Suhu: ${(20 + Math.random() * 60).toFixed(1)}°C`
          } else if (randomLine.includes('pressure')) {
            output = `Tekanan: ${(3 + Math.random() * 3).toFixed(1)} bar`
          } else if (randomLine.includes('voltage')) {
            output = `Tegangan: ${(11 + Math.random() * 3).toFixed(1)}V`
          }
          
          addSerialMessage({
            timestamp: new Date(),
            message: output,
            type: 'output'
          })
        }
      }
    }, 1000)

  }, [arduino.isRunning, compileCode, setRunning, addSerialMessage])

  // Stop code execution
  const stopExecution = useCallback(() => {
    if (serialIntervalRef.current) {
      clearInterval(serialIntervalRef.current)
      serialIntervalRef.current = null
    }
    
    setRunning(false)
    addSerialMessage({
      timestamp: new Date(),
      message: 'Eksekusi dihentikan',
      type: 'output'
    })
  }, [setRunning, addSerialMessage])

  // Update pin configuration
  const updatePinConfig = useCallback((pinIndex: number, updates: Partial<PinConfig>) => {
    if (!arduino.currentProject) return

    const updatedPinConfig = [...arduino.currentProject.pinConfig]
    updatedPinConfig[pinIndex] = { ...updatedPinConfig[pinIndex], ...updates }
    
    updateCurrentProject({ pinConfig: updatedPinConfig })
  }, [arduino.currentProject, updateCurrentProject])

  // Add new pin configuration
  const addPinConfig = useCallback((pin: number) => {
    if (!arduino.currentProject) return

    const newPin: PinConfig = {
      pin,
      mode: 'INPUT',
      value: 0,
      connected: false,
      label: `Pin ${pin}`
    }

    const updatedPinConfig = [...arduino.currentProject.pinConfig, newPin]
    updateCurrentProject({ pinConfig: updatedPinConfig })
  }, [arduino.currentProject, updateCurrentProject])

  // Remove pin configuration
  const removePinConfig = useCallback((pinIndex: number) => {
    if (!arduino.currentProject) return

    const updatedPinConfig = arduino.currentProject.pinConfig.filter((_, index) => index !== pinIndex)
    updateCurrentProject({ pinConfig: updatedPinConfig })
  }, [arduino.currentProject, updateCurrentProject])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serialIntervalRef.current) {
        clearInterval(serialIntervalRef.current)
      }
    }
  }, [])

  // Load projects on mount
  useEffect(() => {
    if (arduino.projects.length === 0) {
      loadProjects()
    }
  }, [arduino.projects.length, loadProjects])

  return {
    // State
    projects: arduino.projects,
    currentProject: arduino.currentProject,
    serialMonitor: arduino.serialMonitor,
    isCompiling: arduino.isCompiling,
    isRunning: arduino.isRunning,
    boards: ARDUINO_BOARDS,
    templates: ARDUINO_TEMPLATES,

    // Actions
    loadProjects,
    createProject,
    saveProject,
    deleteProject,
    setCurrentProject,
    updateCurrentProject,
    compileCode,
    runCode,
    stopExecution,
    updatePinConfig,
    addPinConfig,
    removePinConfig,
    addSerialMessage,
    clearSerialMonitor
  }
}