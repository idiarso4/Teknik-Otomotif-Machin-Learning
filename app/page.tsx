"use client"

import { useState } from "react"
import { MainNav, DashboardContent, SensorContent, AIDetectionContent, LearningContent, ArduinoContent, AnalyticsContent, ControlContent } from "@/components/navigation/main-nav"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

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

  return (
    <div className="min-h-screen bg-background">
      <MainNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  )
}