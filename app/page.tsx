"use client"

import { useState } from "react"
import { MainNav, DashboardContent, SensorContent, AIDetectionContent, LearningContent, ArduinoContent, AnalyticsContent, ControlContent } from "@/components/navigation/main-nav"
import { Sidebar } from "@/components/navigation/sidebar"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Menu } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [layoutMode, setLayoutMode] = useState<"tabs" | "sidebar">("tabs")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "sensor":
        return <SensorContent />
      case "ai-detection":
        return <AIDetectionContent />
      case "learning":
        return <LearningContent />
      case "arduino":
        return <ArduinoContent />
      case "analytics":
        return <AnalyticsContent />
      case "control":
        return <ControlContent />
      default:
        return <DashboardContent />
    }
  }

  const toggleLayout = () => {
    setLayoutMode(layoutMode === "tabs" ? "sidebar" : "tabs")
  }

  if (layoutMode === "sidebar") {
    return (
      <div className="min-h-screen bg-background">
        <MainNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex">
          <div className="hidden md:block border-r">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  {activeTab === "dashboard" && "Dashboard"}
                  {activeTab === "sensor" && "Data Sensor"}
                  {activeTab === "ai-detection" && "Deteksi AI"}
                  {activeTab === "learning" && "Modul Pembelajaran"}
                  {activeTab === "arduino" && "Arduino IDE"}
                  {activeTab === "analytics" && "Analitik"}
                  {activeTab === "control" && "Panel Kontrol"}
                </h2>
                <Button variant="outline" size="sm" onClick={toggleLayout}>
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Mode Tab
                </Button>
              </div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Simulasi AI Otomotif</h2>
          <Button variant="outline" size="sm" onClick={toggleLayout} className="hidden md:flex">
            <Menu className="h-4 w-4 mr-2" />
            Mode Sidebar
          </Button>
        </div>
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}