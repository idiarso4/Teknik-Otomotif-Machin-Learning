"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, RotateCcw } from "lucide-react"

export interface ChartConfigOptions {
  timeRange: number // in minutes
  updateInterval: number // in milliseconds
  maxDataPoints: number
  showGrid: boolean
  showLegend: boolean
  showTooltip: boolean
  lineWidth: number
  animationEnabled: boolean
  colorScheme: "default" | "dark" | "colorful"
  autoScale: boolean
  minValue?: number
  maxValue?: number
}

interface ChartConfigProps {
  config: ChartConfigOptions
  onConfigChange: (config: ChartConfigOptions) => void
  title?: string
}

const defaultConfig: ChartConfigOptions = {
  timeRange: 5,
  updateInterval: 1000,
  maxDataPoints: 50,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  lineWidth: 2,
  animationEnabled: true,
  colorScheme: "default",
  autoScale: true,
  minValue: 0,
  maxValue: 100
}

export function ChartConfig({ config, onConfigChange, title = "Chart Configuration" }: ChartConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState<ChartConfigOptions>(config)

  const handleSave = () => {
    onConfigChange(localConfig)
    setIsOpen(false)
  }

  const handleReset = () => {
    setLocalConfig(defaultConfig)
  }

  const updateConfig = (key: keyof ChartConfigOptions, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          ×
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range */}
        <div className="space-y-2">
          <Label htmlFor="timeRange">Time Range (minutes)</Label>
          <Select
            value={localConfig.timeRange.toString()}
            onValueChange={(value) => updateConfig("timeRange", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 minute</SelectItem>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Update Interval */}
        <div className="space-y-2">
          <Label htmlFor="updateInterval">Update Interval (ms)</Label>
          <Select
            value={localConfig.updateInterval.toString()}
            onValueChange={(value) => updateConfig("updateInterval", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100ms (Fast)</SelectItem>
              <SelectItem value="500">500ms</SelectItem>
              <SelectItem value="1000">1s (Normal)</SelectItem>
              <SelectItem value="2000">2s</SelectItem>
              <SelectItem value="5000">5s (Slow)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Data Points */}
        <div className="space-y-2">
          <Label htmlFor="maxDataPoints">Max Data Points: {localConfig.maxDataPoints}</Label>
          <Slider
            value={[localConfig.maxDataPoints]}
            onValueChange={(value) => updateConfig("maxDataPoints", value[0])}
            max={200}
            min={10}
            step={10}
            className="w-full"
          />
        </div>

        {/* Line Width */}
        <div className="space-y-2">
          <Label htmlFor="lineWidth">Line Width: {localConfig.lineWidth}px</Label>
          <Slider
            value={[localConfig.lineWidth]}
            onValueChange={(value) => updateConfig("lineWidth", value[0])}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Color Scheme */}
        <div className="space-y-2">
          <Label htmlFor="colorScheme">Color Scheme</Label>
          <Select
            value={localConfig.colorScheme}
            onValueChange={(value) => updateConfig("colorScheme", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="colorful">Colorful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Value Range (when auto-scale is off) */}
        {!localConfig.autoScale && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minValue">Min Value</Label>
                <Input
                  type="number"
                  value={localConfig.minValue || 0}
                  onChange={(e) => updateConfig("minValue", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxValue">Max Value</Label>
                <Input
                  type="number"
                  value={localConfig.maxValue || 100}
                  onChange={(e) => updateConfig("maxValue", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toggle Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showGrid">Show Grid</Label>
            <Switch
              checked={localConfig.showGrid}
              onCheckedChange={(checked) => updateConfig("showGrid", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showLegend">Show Legend</Label>
            <Switch
              checked={localConfig.showLegend}
              onCheckedChange={(checked) => updateConfig("showLegend", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showTooltip">Show Tooltip</Label>
            <Switch
              checked={localConfig.showTooltip}
              onCheckedChange={(checked) => updateConfig("showTooltip", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="animationEnabled">Enable Animation</Label>
            <Switch
              checked={localConfig.animationEnabled}
              onCheckedChange={(checked) => updateConfig("animationEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoScale">Auto Scale</Label>
            <Switch
              checked={localConfig.autoScale}
              onCheckedChange={(checked) => updateConfig("autoScale", checked)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
