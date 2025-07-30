"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Gauge, 
  Brain, 
  BookOpen, 
  Cpu, 
  Settings, 
  BarChart3,
  Thermometer,
  Zap,
  Wrench
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
    icon: <Gauge className="h-4 w-4" />,
    description: "Tampilan utama sistem monitoring"
  },
  {
    id: "sensor",
    label: "Data Sensor",
    icon: <Thermometer className="h-4 w-4" />,
    description: "Monitoring sensor otomotif real-time"
  },
  {
    id: "ai-detection",
    label: "Deteksi AI",
    icon: <Brain className="h-4 w-4" />,
    description: "Analisis kesalahan berbasis AI"
  },
  {
    id: "learning",
    label: "Modul Pembelajaran",
    icon: <BookOpen className="h-4 w-4" />,
    description: "Materi pembelajaran interaktif"
  },
  {
    id: "arduino",
    label: "Arduino IDE",
    icon: <Cpu className="h-4 w-4" />,
    description: "Editor kode Arduino"
  },
  {
    id: "analytics",
    label: "Analitik",
    icon: <BarChart3 className="h-4 w-4" />,
    description: "Laporan dan statistik sistem"
  },
  {
    id: "control",
    label: "Panel Kontrol",
    icon: <Settings className="h-4 w-4" />,
    description: "Pengaturan simulasi dan sistem"
  }
]

interface MainNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MainNav({ activeTab, onTabChange }: MainNavProps) {
  return (
    <div className="w-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Simulasi AI Otomotif</h1>
                  <p className="text-sm text-muted-foreground">SMK Negeri 1 Punggelan</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Sistem Aktif</span>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:flex">
              {navigationItems.map((item) => (
                <TabsTrigger 
                  key={item.id} 
                  value={item.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Komponen placeholder untuk setiap tab
export function DashboardContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suhu Mesin</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85°C</div>
            <p className="text-xs text-muted-foreground">Normal</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tekanan Oli</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 bar</div>
            <p className="text-xs text-muted-foreground">Normal</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tegangan Baterai</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.6V</div>
            <p className="text-xs text-muted-foreground">Baik</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPM Mesin</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">Idle Normal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function SensorContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Sensor Real-time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Monitoring sensor otomotif akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AIDetectionContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Deteksi Kesalahan AI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sistem deteksi kesalahan berbasis AI akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function LearningContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Modul Pembelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Materi pembelajaran interaktif akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ArduinoContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Arduino IDE Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Editor kode Arduino akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Analitik Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Laporan dan analitik sistem akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ControlContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel Kontrol Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Pengaturan dan kontrol sistem akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  )
}