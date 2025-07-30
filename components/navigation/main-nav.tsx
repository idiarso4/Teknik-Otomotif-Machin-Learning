"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"
import { MobileSidebar } from "@/components/navigation/sidebar"
import { RealTimeLineChart } from "@/components/charts/real-time-line-chart"
import { GaugeChart } from "@/components/charts/gauge-chart"
import { HistogramChart } from "@/components/charts/histogram-chart"
import { AutomotiveStatusIndicators } from "@/components/charts/status-indicators"
import { AIResultsPanel } from "@/components/ai-detection/ai-results-panel"
import { FaultSeverityChart } from "@/components/ai-detection/fault-severity-chart"
import { RepairRecommendations } from "@/components/ai-detection/repair-recommendations"
import { DetectionHistoryTable } from "@/components/ai-detection/detection-history-table"
import { AIModelConfig } from "@/components/ai-detection/ai-model-config"
import { ArduinoCodeEditor } from "@/components/arduino/arduino-code-editor"
import { ArduinoPinConfig } from "@/components/arduino/arduino-pin-config"
import { SerialMonitor } from "@/components/arduino/serial-monitor"
import { ArduinoProjectManager } from "@/components/arduino/arduino-project-manager"
import {
  Gauge,
  Brain,
  BookOpen,
  Cpu,
  Settings,
  BarChart3,
  Thermometer,
  Zap,
  Wrench,
  Bell,
  Menu
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
  const { toast } = useToast()

  const showNotification = () => {
    toast({
      title: "Sistem Notifikasi",
      description: "Sistem notifikasi telah aktif dan berfungsi dengan baik.",
      variant: "success",
    })
  }

  return (
    <div className="w-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
              <div className="flex items-center space-x-2">
                <Wrench className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Simulasi AI Otomotif</h1>
                  <p className="text-sm text-muted-foreground">SMK Negeri 1 Punggelan</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Sistem Aktif</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={showNotification}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>

              <ThemeToggle />
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard Sistem</h2>
          <p className="text-muted-foreground">Monitoring status sistem otomotif secara real-time</p>
        </div>

        {/* Status Indicators */}
        <AutomotiveStatusIndicators />

        {/* Quick Overview Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <RealTimeLineChart
            title="Monitoring Suhu Mesin"
            dataKey="engineTemp"
            color="#ef4444"
            unit="°C"
            minValue={70}
            maxValue={110}
            maxDataPoints={30}
            generateValue={() => 85 + Math.sin(Date.now() / 10000) * 8 + (Math.random() - 0.5) * 4}
          />
          <GaugeChart
            title="Status Sistem Keseluruhan"
            unit="%"
            minValue={0}
            maxValue={100}
            thresholds={{ low: 70, medium: 85, high: 95 }}
            generateValue={() => 88 + Math.sin(Date.now() / 20000) * 5 + (Math.random() - 0.5) * 3}
          />
        </div>
      </div>
    </div>
  )
}

export function SensorContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Data Sensor Real-time</h2>
          <p className="text-muted-foreground">Monitoring sensor otomotif dengan visualisasi data real-time</p>
        </div>

        {/* Real-time Line Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <RealTimeLineChart
            title="Suhu Mesin"
            dataKey="temperature"
            color="#ef4444"
            unit="°C"
            minValue={70}
            maxValue={110}
            generateValue={() => 85 + Math.sin(Date.now() / 10000) * 10 + (Math.random() - 0.5) * 5}
          />
          <RealTimeLineChart
            title="Tekanan Oli"
            dataKey="oilPressure"
            color="#3b82f6"
            unit=" PSI"
            minValue={20}
            maxValue={60}
            generateValue={() => 45 + Math.cos(Date.now() / 8000) * 8 + (Math.random() - 0.5) * 3}
          />
        </div>

        {/* Gauge Charts */}
        <div className="grid gap-6 md:grid-cols-3">
          <GaugeChart
            title="Voltase Baterai"
            unit="V"
            minValue={11}
            maxValue={14}
            thresholds={{ low: 12, medium: 12.5, high: 13.5 }}
            generateValue={() => 12.6 + Math.sin(Date.now() / 15000) * 0.5 + (Math.random() - 0.5) * 0.2}
          />
          <GaugeChart
            title="RPM Mesin"
            unit=" RPM"
            minValue={0}
            maxValue={5000}
            thresholds={{ low: 1000, medium: 3000, high: 4000 }}
            generateValue={() => 2500 + Math.sin(Date.now() / 12000) * 800 + (Math.random() - 0.5) * 200}
          />
          <GaugeChart
            title="Konsumsi Bahan Bakar"
            unit=" L/h"
            minValue={0}
            maxValue={20}
            thresholds={{ low: 5, medium: 12, high: 16 }}
            generateValue={() => 8 + Math.sin(Date.now() / 20000) * 3 + (Math.random() - 0.5) * 2}
          />
        </div>

        {/* Histogram for Vibration Analysis */}
        <div className="grid gap-6 md:grid-cols-2">
          <HistogramChart
            title="Analisis Getaran Mesin"
            unit=" Hz"
            binCount={12}
            minValue={30}
            maxValue={80}
            updateInterval={50}
            sampleSize={500}
            generateValue={() => {
              // Simulate engine vibration with multiple frequency components
              const baseFreq = 50
              const harmonic1 = Math.sin(Date.now() / 100) * 5
              const harmonic2 = Math.sin(Date.now() / 200) * 3
              const noise = (Math.random() - 0.5) * 8
              return baseFreq + harmonic1 + harmonic2 + noise
            }}
          />
          <HistogramChart
            title="Distribusi Suhu Sistem"
            unit="°C"
            binCount={10}
            minValue={75}
            maxValue={95}
            updateInterval={200}
            sampleSize={300}
            generateValue={() => {
              // Normal distribution around 85°C
              const mean = 85
              const stdDev = 3
              const u1 = Math.random()
              const u2 = Math.random()
              const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
              return mean + z0 * stdDev
            }}
          />
        </div>
      </div>
    </div>
  )
}

export function AIDetectionContent() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard Deteksi AI</h2>
          <p className="text-muted-foreground">
            Sistem deteksi kesalahan otomotif menggunakan algoritma Random Forest dengan analisis real-time
          </p>
        </div>

        {/* AI Results Panel */}
        <AIResultsPanel showControls={true} maxResults={5} />

        {/* Fault Severity Visualization */}
        <FaultSeverityChart />

        {/* Repair Recommendations */}
        <RepairRecommendations />

        {/* Detection History Table */}
        <DetectionHistoryTable />

        {/* AI Model Configuration */}
        <AIModelConfig />
      </div>
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Arduino IDE Simulator</h2>
          <p className="text-muted-foreground">
            Integrated development environment untuk programming Arduino dengan simulasi hardware
          </p>
        </div>

        {/* Project Manager */}
        <ArduinoProjectManager />

        {/* Code Editor */}
        <ArduinoCodeEditor />

        {/* Pin Configuration and Serial Monitor */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ArduinoPinConfig />
          <SerialMonitor />
        </div>
      </div>
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