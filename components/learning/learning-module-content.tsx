"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Wrench,
  Zap,
  Thermometer,
  Gauge,
  Cpu
} from "lucide-react"
import { WokwiSimulator, WOKWI_PROJECTS } from "./wokwi-simulator"
import { cn } from "@/lib/utils"

export interface LearningModule {
  id: string
  title: string
  description: string
  category: 'electrical' | 'cooling' | 'fuel' | 'vibration'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // in minutes
  sections: LearningSection[]
  completed: boolean
  progress: number // 0-100
}

export interface LearningSection {
  id: string
  title: string
  type: 'theory' | 'simulation' | 'code' | 'quiz' | 'wokwi'
  content: string
  images?: string[]
  codeExample?: string
  simulationConfig?: any
  wokwiProjectId?: string
  completed: boolean
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: "electrical-basics",
    title: "Sistem Kelistrikan Otomotif",
    description: "Pelajari dasar-dasar sistem kelistrikan kendaraan, termasuk baterai, alternator, dan sistem pengapian",
    category: "electrical",
    difficulty: "beginner",
    estimatedTime: 45,
    completed: false,
    progress: 0,
    sections: [
      {
        id: "electrical-intro",
        title: "Pengenalan Sistem Kelistrikan",
        type: "theory",
        content: `
# Sistem Kelistrikan Otomotif

Sistem kelistrikan adalah jantung dari kendaraan modern. Sistem ini bertanggung jawab untuk:

## Komponen Utama:
- **Baterai**: Menyimpan energi listrik untuk starter dan sistem lainnya
- **Alternator**: Menghasilkan listrik saat mesin berjalan
- **Starter**: Motor listrik untuk menghidupkan mesin
- **Sistem Pengapian**: Menghasilkan percikan api untuk pembakaran

## Prinsip Kerja:
1. Baterai menyediakan daya awal untuk starter
2. Starter memutar mesin hingga hidup
3. Alternator mengambil alih dan mengisi baterai
4. Sistem pengapian mengatur waktu pembakaran

## Voltase Standar:
- Sistem 12V untuk mobil penumpang
- Sistem 24V untuk kendaraan komersial
- Toleransi normal: 12.6V (mesin mati) - 14.4V (mesin hidup)
        `,
        completed: false
      },
      {
        id: "electrical-simulation",
        title: "Simulasi Pengukuran Voltase",
        type: "simulation",
        content: "Praktik mengukur voltase baterai dalam berbagai kondisi",
        simulationConfig: {
          type: "voltage_measurement",
          parameters: ["batteryVoltage"],
          targetRange: [12.0, 14.5]
        },
        completed: false
      },
      {
        id: "electrical-code",
        title: "Kode Arduino untuk Monitoring Voltase",
        type: "code",
        content: "Implementasi monitoring voltase baterai menggunakan Arduino",
        codeExample: `
// Monitoring Voltase Baterai
const int voltagePin = A2;
const float voltageDivider = 3.0; // Rasio pembagi tegangan

void setup() {
  Serial.begin(9600);
  Serial.println("Battery Voltage Monitor");
}

void loop() {
  // Baca nilai ADC
  int adcValue = analogRead(voltagePin);
  
  // Konversi ke voltase
  float voltage = (adcValue * 5.0 / 1024.0) * voltageDivider;
  
  // Tampilkan hasil
  Serial.print("Battery Voltage: ");
  Serial.print(voltage, 2);
  Serial.println("V");
  
  // Cek kondisi baterai
  if (voltage < 12.0) {
    Serial.println("WARNING: Low battery voltage!");
  } else if (voltage > 14.5) {
    Serial.println("WARNING: Overcharging detected!");
  } else {
    Serial.println("Battery voltage normal");
  }
  
  delay(1000);
}
        `,
        completed: false
      },
      {
        id: "electrical-wokwi",
        title: "Praktik dengan Wokwi Simulator",
        type: "wokwi",
        content: "Praktik langsung monitoring voltase baterai menggunakan simulator Wokwi",
        wokwiProjectId: "battery-voltage-monitor",
        completed: false
      }
    ]
  },
  {
    id: "cooling-system",
    title: "Sistem Pendingin Mesin",
    description: "Memahami cara kerja sistem pendingin, thermostat, radiator, dan water pump",
    category: "cooling",
    difficulty: "intermediate",
    estimatedTime: 60,
    completed: false,
    progress: 0,
    sections: [
      {
        id: "cooling-theory",
        title: "Teori Sistem Pendingin",
        type: "theory",
        content: `
# Sistem Pendingin Mesin

Sistem pendingin menjaga suhu mesin dalam rentang operasi yang optimal.

## Komponen Utama:
- **Radiator**: Membuang panas ke udara
- **Water Pump**: Mensirkulasikan coolant
- **Thermostat**: Mengatur aliran coolant
- **Cooling Fan**: Membantu pendinginan radiator
- **Coolant**: Cairan pendingin dengan anti-freeze

## Cara Kerja:
1. Coolant menyerap panas dari mesin
2. Water pump mensirkulasikan coolant
3. Thermostat membuka saat suhu tinggi
4. Radiator membuang panas ke udara
5. Fan membantu aliran udara

## Suhu Operasi Normal:
- Suhu kerja: 80-95°C
- Thermostat buka: 82-88°C
- Suhu kritis: >105°C
        `,
        completed: false
      },
      {
        id: "cooling-simulation",
        title: "Simulasi Monitoring Suhu",
        type: "simulation",
        content: "Simulasi monitoring suhu mesin dan respons sistem pendingin",
        simulationConfig: {
          type: "temperature_monitoring",
          parameters: ["engineTemp"],
          targetRange: [80, 95]
        },
        completed: false
      },
      {
        id: "cooling-wokwi",
        title: "Praktik Monitoring Suhu dengan Wokwi",
        type: "wokwi",
        content: "Praktik monitoring suhu mesin menggunakan sensor DS18B20 di Wokwi",
        wokwiProjectId: "engine-temp-monitor",
        completed: false
      }
    ]
  }
]

interface LearningModuleContentProps {
  moduleId?: string
  onModuleComplete?: (moduleId: string) => void
}

export function LearningModuleContent({ moduleId, onModuleComplete }: LearningModuleContentProps) {
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [modules, setModules] = useState<LearningModule[]>(LEARNING_MODULES)

  useEffect(() => {
    if (moduleId) {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        setSelectedModule(module)
        setCurrentSectionIndex(0)
      }
    }
  }, [moduleId, modules])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electrical': return <Zap className="h-4 w-4" />
      case 'cooling': return <Thermometer className="h-4 w-4" />
      case 'fuel': return <Gauge className="h-4 w-4" />
      case 'vibration': return <Wrench className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const completeSection = (moduleId: string, sectionId: string) => {
    setModules(prev => prev.map(module => {
      if (module.id === moduleId) {
        const updatedSections = module.sections.map(section => 
          section.id === sectionId ? { ...section, completed: true } : section
        )
        const completedSections = updatedSections.filter(s => s.completed).length
        const progress = Math.round((completedSections / updatedSections.length) * 100)
        const moduleCompleted = progress === 100

        if (moduleCompleted && onModuleComplete) {
          onModuleComplete(moduleId)
        }

        return {
          ...module,
          sections: updatedSections,
          progress,
          completed: moduleCompleted
        }
      }
      return module
    }))
  }

  const nextSection = () => {
    if (selectedModule && currentSectionIndex < selectedModule.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1)
    }
  }

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1)
    }
  }

  const renderSectionContent = (section: LearningSection) => {
    switch (section.type) {
      case 'theory':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{section.content}</div>
          </div>
        )
      case 'code':
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <p>{section.content}</p>
            </div>
            {section.codeExample && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{section.codeExample}</pre>
              </div>
            )}
          </div>
        )
      case 'simulation':
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <p>{section.content}</p>
            </div>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Simulasi interaktif akan dimuat di sini</p>
              <Button className="mt-4">
                <Play className="h-4 w-4 mr-2" />
                Mulai Simulasi
              </Button>
            </div>
          </div>
        )
      case 'wokwi':
        const wokwiProject = section.wokwiProjectId ?
          WOKWI_PROJECTS.find(p => p.id === section.wokwiProjectId) : null
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <p>{section.content}</p>
            </div>
            {wokwiProject ? (
              <WokwiSimulator
                project={wokwiProject}
                embedded={true}
                onProjectComplete={(projectId) => {
                  completeSection(selectedModule.id, section.id)
                }}
              />
            ) : (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Proyek Wokwi tidak ditemukan</p>
              </div>
            )}
          </div>
        )
      default:
        return <div>{section.content}</div>
    }
  }

  if (!selectedModule) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Pilih Modul Pembelajaran</h2>
          <p className="text-muted-foreground">
            Pilih modul pembelajaran yang ingin Anda pelajari
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <Card 
              key={module.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedModule(module)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(module.category)}
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  {module.completed && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selesai
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{module.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {module.estimatedTime} menit
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const currentSection = selectedModule.sections[currentSectionIndex]

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedModule(null)}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Modul
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{selectedModule.title}</h2>
          <p className="text-muted-foreground">{selectedModule.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{selectedModule.progress}%</div>
          <div className="text-sm text-muted-foreground">Selesai</div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={selectedModule.progress} className="h-3" />

      {/* Section Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              {currentSection.type === 'theory' && <BookOpen className="h-5 w-5" />}
              {currentSection.type === 'simulation' && <Play className="h-5 w-5" />}
              {currentSection.type === 'code' && <Lightbulb className="h-5 w-5" />}
              {currentSection.type === 'wokwi' && <Cpu className="h-5 w-5" />}
              {currentSection.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Bagian {currentSectionIndex + 1} dari {selectedModule.sections.length}
            </p>
          </div>
          {currentSection.completed && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Selesai
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {renderSectionContent(currentSection)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevSection}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>

        <div className="flex items-center gap-2">
          {!currentSection.completed && (
            <Button 
              onClick={() => completeSection(selectedModule.id, currentSection.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tandai Selesai
            </Button>
          )}
          
          <Button 
            onClick={nextSection}
            disabled={currentSectionIndex === selectedModule.sections.length - 1}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
