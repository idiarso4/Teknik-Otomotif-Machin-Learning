"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { 
  Gauge, 
  Brain, 
  BookOpen, 
  Cpu, 
  Settings, 
  BarChart3,
  Thermometer,
  Zap,
  Menu,
  X
} from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Gauge className="h-5 w-5" />,
    description: "Tampilan utama sistem monitoring"
  },
  {
    id: "sensor",
    label: "Data Sensor",
    icon: <Thermometer className="h-5 w-5" />,
    description: "Monitoring sensor otomotif real-time"
  },
  {
    id: "ai-detection",
    label: "Deteksi AI",
    icon: <Brain className="h-5 w-5" />,
    description: "Analisis kesalahan berbasis AI"
  },
  {
    id: "learning",
    label: "Modul Pembelajaran",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Materi pembelajaran interaktif"
  },
  {
    id: "arduino",
    label: "Arduino IDE",
    icon: <Cpu className="h-5 w-5" />,
    description: "Editor kode Arduino"
  },
  {
    id: "analytics",
    label: "Analitik",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "Laporan dan statistik sistem"
  },
  {
    id: "control",
    label: "Panel Kontrol",
    icon: <Settings className="h-5 w-5" />,
    description: "Pengaturan sistem dan simulasi"
  }
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigasi
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  activeTab === item.id && "bg-secondary"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MobileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu Navigasi</h2>
        </div>
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} className="w-full" />
      </SheetContent>
    </Sheet>
  )
}
