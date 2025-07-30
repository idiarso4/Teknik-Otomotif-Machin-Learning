"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAIDetection } from "@/lib/hooks/use-ai-detection"
import { DetectionResult, DetectionStatus } from "@/lib/types/ai-detection"
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  User,
  BookOpen,
  ExternalLink,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RepairRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  estimatedCost: string
  tools: string[]
  steps: string[]
  relatedParameters: string[]
  videoUrl?: string
  manualPage?: string
}

const REPAIR_RECOMMENDATIONS: Record<string, RepairRecommendation[]> = {
  'engineTemp': [
    {
      id: 'coolant-check',
      title: 'Periksa Sistem Pendingin',
      description: 'Suhu mesin tinggi dapat disebabkan oleh masalah pada sistem pendingin',
      priority: 'high',
      difficulty: 'easy',
      estimatedTime: '15-30 menit',
      estimatedCost: 'Rp 50.000 - 200.000',
      tools: ['Kunci pas', 'Termometer', 'Coolant tester'],
      steps: [
        'Pastikan mesin dalam keadaan dingin',
        'Periksa level coolant di radiator',
        'Periksa kebocoran pada selang radiator',
        'Test tekanan sistem pendingin',
        'Ganti coolant jika diperlukan'
      ],
      relatedParameters: ['engineTemp'],
      videoUrl: 'https://example.com/coolant-check',
      manualPage: 'Halaman 45-52'
    },
    {
      id: 'thermostat-replace',
      title: 'Ganti Thermostat',
      description: 'Thermostat yang rusak dapat menyebabkan overheating',
      priority: 'medium',
      difficulty: 'medium',
      estimatedTime: '45-60 menit',
      estimatedCost: 'Rp 150.000 - 300.000',
      tools: ['Kunci pas set', 'Gasket scraper', 'Torque wrench'],
      steps: [
        'Kuras coolant dari radiator',
        'Lepas housing thermostat',
        'Bersihkan permukaan gasket',
        'Pasang thermostat baru dengan gasket',
        'Isi ulang coolant dan bleed system'
      ],
      relatedParameters: ['engineTemp'],
      manualPage: 'Halaman 53-58'
    }
  ],
  'oilPressure': [
    {
      id: 'oil-change',
      title: 'Ganti Oli Mesin',
      description: 'Tekanan oli rendah mungkin disebabkan oli kotor atau viskositas tidak sesuai',
      priority: 'high',
      difficulty: 'easy',
      estimatedTime: '30-45 menit',
      estimatedCost: 'Rp 200.000 - 500.000',
      tools: ['Kunci filter oli', 'Pan penampung', 'Funnel'],
      steps: [
        'Panaskan mesin hingga suhu operasi',
        'Matikan mesin dan tunggu 5 menit',
        'Kuras oli lama',
        'Ganti filter oli',
        'Isi oli baru sesuai spesifikasi'
      ],
      relatedParameters: ['oilPressure'],
      videoUrl: 'https://example.com/oil-change',
      manualPage: 'Halaman 25-32'
    },
    {
      id: 'oil-pump-check',
      title: 'Periksa Pompa Oli',
      description: 'Pompa oli yang lemah dapat menyebabkan tekanan rendah',
      priority: 'high',
      difficulty: 'hard',
      estimatedTime: '2-4 jam',
      estimatedCost: 'Rp 800.000 - 1.500.000',
      tools: ['Pressure gauge', 'Socket set', 'Torque wrench'],
      steps: [
        'Test tekanan oli dengan gauge',
        'Periksa relief valve',
        'Inspeksi rotor dan housing pompa',
        'Ganti komponen yang aus',
        'Reassemble dan test ulang'
      ],
      relatedParameters: ['oilPressure'],
      manualPage: 'Halaman 85-95'
    }
  ],
  'batteryVoltage': [
    {
      id: 'battery-test',
      title: 'Test dan Bersihkan Baterai',
      description: 'Voltase rendah dapat disebabkan baterai lemah atau terminal kotor',
      priority: 'medium',
      difficulty: 'easy',
      estimatedTime: '20-30 menit',
      estimatedCost: 'Rp 25.000 - 100.000',
      tools: ['Multimeter', 'Sikat kawat', 'Baking soda'],
      steps: [
        'Test voltase baterai dengan multimeter',
        'Bersihkan terminal dari korosi',
        'Periksa kekencangan terminal',
        'Test specific gravity elektrolit',
        'Charge baterai jika diperlukan'
      ],
      relatedParameters: ['batteryVoltage'],
      videoUrl: 'https://example.com/battery-test',
      manualPage: 'Halaman 110-115'
    }
  ]
}

export function RepairRecommendations() {
  const { currentAnalysis } = useAIDetection()
  const [selectedRecommendation, setSelectedRecommendation] = useState<RepairRecommendation | null>(null)
  const [recommendations, setRecommendations] = useState<RepairRecommendation[]>([])

  useEffect(() => {
    if (currentAnalysis && currentAnalysis.length > 0) {
      const allRecommendations: RepairRecommendation[] = []
      
      currentAnalysis.forEach(result => {
        if (result.status !== 'normal') {
          const paramRecommendations = REPAIR_RECOMMENDATIONS[result.parameter] || []
          allRecommendations.push(...paramRecommendations)
        }
      })

      // Sort by priority and remove duplicates
      const uniqueRecommendations = allRecommendations.filter((rec, index, self) => 
        index === self.findIndex(r => r.id === rec.id)
      )
      
      const sortedRecommendations = uniqueRecommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      setRecommendations(sortedRecommendations)
    } else {
      setRecommendations([])
    }
  }, [currentAnalysis])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'default'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'Sulit'
      case 'medium': return 'Sedang'
      default: return 'Mudah'
    }
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Rekomendasi Perbaikan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">Sistem Dalam Kondisi Baik</p>
            <p className="text-sm">Tidak ada rekomendasi perbaikan saat ini</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Rekomendasi Perbaikan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {recommendations.length} rekomendasi berdasarkan hasil analisis AI
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div 
                key={recommendation.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedRecommendation(recommendation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                  </div>
                  <Badge variant={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority === 'high' ? 'Prioritas Tinggi' :
                     recommendation.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{recommendation.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{recommendation.estimatedCost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className={cn("h-4 w-4", getDifficultyColor(recommendation.difficulty))} />
                    <span className={getDifficultyColor(recommendation.difficulty)}>
                      {getDifficultyText(recommendation.difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>{recommendation.tools.length} alat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendation */}
      {selectedRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedRecommendation.title}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedRecommendation(null)}
              >
                Tutup
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tools Required */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Alat yang Diperlukan
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedRecommendation.tools.map((tool, index) => (
                  <Badge key={index} variant="outline">{tool}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Steps */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Langkah-langkah Perbaikan
              </h4>
              <ol className="space-y-2">
                {selectedRecommendation.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Additional Resources */}
            <div className="flex flex-wrap gap-4">
              {selectedRecommendation.videoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedRecommendation.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Video Tutorial
                  </a>
                </Button>
              )}
              {selectedRecommendation.manualPage && (
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {selectedRecommendation.manualPage}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
