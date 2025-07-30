"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WokwiSimulator, WOKWI_PROJECTS } from "./wokwi-simulator"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Code, 
  Cpu,
  Zap,
  Thermometer,
  Gauge,
  Settings,
  Clock,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WokwiProjectGalleryProps {
  onProjectSelect?: (projectId: string) => void
  embedded?: boolean
}

export function WokwiProjectGallery({ onProjectSelect, embedded = false }: WokwiProjectGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const { toast } = useToast()

  const filteredProjects = WOKWI_PROJECTS.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || project.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electrical': return <Zap className="h-4 w-4" />
      case 'cooling': return <Thermometer className="h-4 w-4" />
      case 'fuel': return <Gauge className="h-4 w-4" />
      case 'vibration': return <Settings className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'electrical': return 'Kelistrikan'
      case 'cooling': return 'Pendingin'
      case 'fuel': return 'Bahan Bakar'
      case 'vibration': return 'Getaran'
      default: return category
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

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Pemula'
      case 'intermediate': return 'Menengah'
      case 'advanced': return 'Lanjutan'
      default: return difficulty
    }
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
    if (onProjectSelect) {
      onProjectSelect(projectId)
    }
  }

  const openInWokwi = (projectId: string) => {
    const project = WOKWI_PROJECTS.find(p => p.id === projectId)
    if (project) {
      window.open("https://wokwi.com/projects/new/arduino-uno", '_blank')
      toast({
        title: "Membuka Wokwi",
        description: `Proyek ${project.title} akan dibuka di Wokwi`,
        variant: "default"
      })
    }
  }

  if (selectedProject && !embedded) {
    const project = WOKWI_PROJECTS.find(p => p.id === selectedProject)
    if (project) {
      return (
        <WokwiSimulator 
          project={project}
          onProjectComplete={(projectId) => {
            toast({
              title: "Proyek Selesai!",
              description: `Proyek ${project.title} telah diselesaikan`,
              variant: "success"
            })
            setSelectedProject(null)
          }}
        />
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold mb-2">Galeri Proyek Wokwi</h3>
        <p className="text-muted-foreground">
          Koleksi proyek Arduino untuk simulasi sistem otomotif menggunakan Wokwi
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari proyek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="electrical">Kelistrikan</SelectItem>
            <SelectItem value="cooling">Pendingin</SelectItem>
            <SelectItem value="fuel">Bahan Bakar</SelectItem>
            <SelectItem value="vibration">Getaran</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Tingkat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tingkat</SelectItem>
            <SelectItem value="beginner">Pemula</SelectItem>
            <SelectItem value="intermediate">Menengah</SelectItem>
            <SelectItem value="advanced">Lanjutan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(project.category)}
                  <CardTitle className="text-base">{project.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(project.difficulty)}>
                  {getDifficultyName(project.difficulty)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(project.category)}
                  <span>{getCategoryName(project.category)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{project.objectives.length} objektif</span>
                </div>
              </div>

              {project.libraries && project.libraries.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Libraries:</div>
                  <div className="flex flex-wrap gap-1">
                    {project.libraries.slice(0, 3).map((lib, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lib}
                      </Badge>
                    ))}
                    {project.libraries.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.libraries.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Mulai Proyek
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openInWokwi(project.id)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Tidak ada proyek ditemukan</h3>
          <p className="text-muted-foreground">
            Coba ubah filter pencarian atau kata kunci
          </p>
        </div>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Statistik Proyek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {WOKWI_PROJECTS.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Proyek</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {WOKWI_PROJECTS.filter(p => p.difficulty === 'beginner').length}
              </div>
              <div className="text-sm text-muted-foreground">Pemula</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {WOKWI_PROJECTS.filter(p => p.difficulty === 'intermediate').length}
              </div>
              <div className="text-sm text-muted-foreground">Menengah</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {WOKWI_PROJECTS.filter(p => p.difficulty === 'advanced').length}
              </div>
              <div className="text-sm text-muted-foreground">Lanjutan</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
