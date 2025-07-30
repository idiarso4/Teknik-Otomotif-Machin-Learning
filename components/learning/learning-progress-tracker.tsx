"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Star,
  Zap,
  Thermometer,
  Gauge,
  Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningStats {
  totalModules: number
  completedModules: number
  totalSections: number
  completedSections: number
  totalTimeSpent: number // in minutes
  streakDays: number
  lastStudyDate: Date | null
  achievements: Achievement[]
  categoryProgress: CategoryProgress[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlockedAt: Date | null
  requirement: string
}

interface CategoryProgress {
  category: 'electrical' | 'cooling' | 'fuel' | 'vibration'
  name: string
  icon: React.ReactNode
  totalModules: number
  completedModules: number
  progress: number
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-module",
    title: "Langkah Pertama",
    description: "Menyelesaikan modul pembelajaran pertama",
    icon: <BookOpen className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan 1 modul"
  },
  {
    id: "electrical-expert",
    title: "Ahli Kelistrikan",
    description: "Menguasai semua modul sistem kelistrikan",
    icon: <Zap className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan semua modul kelistrikan"
  },
  {
    id: "cooling-master",
    title: "Master Pendingin",
    description: "Menguasai sistem pendingin mesin",
    icon: <Thermometer className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan semua modul pendingin"
  },
  {
    id: "fuel-specialist",
    title: "Spesialis Bahan Bakar",
    description: "Ahli dalam sistem bahan bakar",
    icon: <Gauge className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan semua modul bahan bakar"
  },
  {
    id: "vibration-analyst",
    title: "Analis Getaran",
    description: "Menguasai analisis getaran mesin",
    icon: <Wrench className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan semua modul getaran"
  },
  {
    id: "study-streak",
    title: "Konsisten Belajar",
    description: "Belajar selama 7 hari berturut-turut",
    icon: <Calendar className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Streak 7 hari"
  },
  {
    id: "speed-learner",
    title: "Pembelajar Cepat",
    description: "Menyelesaikan 3 modul dalam sehari",
    icon: <TrendingUp className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "3 modul per hari"
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Menyelesaikan semua modul pembelajaran",
    icon: <Trophy className="h-6 w-6" />,
    unlockedAt: null,
    requirement: "Selesaikan semua modul"
  }
]

export function LearningProgressTracker() {
  const [stats, setStats] = useState<LearningStats>({
    totalModules: 8,
    completedModules: 2,
    totalSections: 24,
    completedSections: 8,
    totalTimeSpent: 180,
    streakDays: 3,
    lastStudyDate: new Date(),
    achievements: ACHIEVEMENTS,
    categoryProgress: [
      {
        category: 'electrical',
        name: 'Sistem Kelistrikan',
        icon: <Zap className="h-4 w-4" />,
        totalModules: 2,
        completedModules: 1,
        progress: 50
      },
      {
        category: 'cooling',
        name: 'Sistem Pendingin',
        icon: <Thermometer className="h-4 w-4" />,
        totalModules: 2,
        completedModules: 1,
        progress: 50
      },
      {
        category: 'fuel',
        name: 'Sistem Bahan Bakar',
        icon: <Gauge className="h-4 w-4" />,
        totalModules: 2,
        completedModules: 0,
        progress: 0
      },
      {
        category: 'vibration',
        name: 'Analisis Getaran',
        icon: <Wrench className="h-4 w-4" />,
        totalModules: 2,
        completedModules: 0,
        progress: 0
      }
    ]
  })

  const overallProgress = Math.round((stats.completedModules / stats.totalModules) * 100)
  const sectionProgress = Math.round((stats.completedSections / stats.totalSections) * 100)

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}j ${mins}m`
    }
    return `${mins}m`
  }

  const unlockedAchievements = stats.achievements.filter(a => a.unlockedAt !== null)
  const lockedAchievements = stats.achievements.filter(a => a.unlockedAt === null)

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Keseluruhan</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedModules} dari {stats.totalModules} modul
            </p>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bagian Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectionProgress}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedSections} dari {stats.totalSections} bagian
            </p>
            <Progress value={sectionProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waktu Belajar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Total waktu pembelajaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak Belajar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              Hari berturut-turut
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Progress per Kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.categoryProgress.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {category.completedModules}/{category.totalModules}
                  </span>
                  <span className={cn("text-sm font-medium", getProgressColor(category.progress))}>
                    {category.progress}%
                  </span>
                </div>
              </div>
              <Progress value={category.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Unlocked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Pencapaian Terbuka ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unlockedAchievements.length > 0 ? (
              <div className="space-y-3">
                {unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-yellow-600">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Dibuka: {achievement.unlockedAt?.toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pencapaian terbuka</p>
                <p className="text-sm">Selesaikan modul untuk membuka pencapaian</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Locked Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" />
              Pencapaian Terkunci ({lockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lockedAchievements.slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <div className="text-muted-foreground opacity-50">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-muted-foreground">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Syarat: {achievement.requirement}
                    </div>
                  </div>
                </div>
              ))}
              {lockedAchievements.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{lockedAchievements.length - 5} pencapaian lainnya
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Pembelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.totalTimeSpent / stats.completedModules) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Menit per modul</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round((stats.completedSections / stats.totalTimeSpent) * 60) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Bagian per jam</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.streakDays}
              </div>
              <div className="text-sm text-muted-foreground">Hari streak terbaik</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm text-muted-foreground">Pencapaian terbuka</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
