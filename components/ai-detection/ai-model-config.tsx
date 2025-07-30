"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAIDetection } from "@/lib/hooks/use-ai-detection"
import { AIModel, DETECTION_PARAMETERS } from "@/lib/types/ai-detection"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Settings, 
  Brain, 
  Save, 
  RotateCcw, 
  Info,
  Zap,
  Target,
  TreePine,
  Layers
} from "lucide-react"

export function AIModelConfig() {
  const { model, updateModel, getCurrentModel } = useAIDetection()
  const { toast } = useToast()
  
  const [localModel, setLocalModel] = useState<AIModel>(model)
  const [parameters, setParameters] = useState(DETECTION_PARAMETERS)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalModel(model)
  }, [model])

  useEffect(() => {
    const hasModelChanges = JSON.stringify(localModel) !== JSON.stringify(model)
    const hasParamChanges = JSON.stringify(parameters) !== JSON.stringify(DETECTION_PARAMETERS)
    setHasChanges(hasModelChanges || hasParamChanges)
  }, [localModel, parameters, model])

  const updateModelParameter = (key: keyof AIModel['parameters'], value: number) => {
    setLocalModel(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }))
  }

  const updateDetectionParameter = (name: string, field: string, value: any) => {
    setParameters(prev => prev.map(param => 
      param.name === name ? { ...param, [field]: value } : param
    ))
  }

  const saveConfiguration = async () => {
    try {
      await updateModel(localModel)
      
      toast({
        title: "Konfigurasi Tersimpan",
        description: "Pengaturan model AI telah berhasil diperbarui",
        variant: "success"
      })
      
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan konfigurasi",
        variant: "destructive"
      })
    }
  }

  const resetToDefaults = () => {
    const defaultModel: AIModel = {
      type: 'RandomForest',
      parameters: {
        nEstimators: 100,
        maxDepth: 10,
        threshold: 0.7
      }
    }
    
    setLocalModel(defaultModel)
    setParameters(DETECTION_PARAMETERS)
    
    toast({
      title: "Reset ke Default",
      description: "Konfigurasi telah dikembalikan ke pengaturan default",
      variant: "default"
    })
  }

  const getModelPerformance = () => {
    const { nEstimators, maxDepth, threshold } = localModel.parameters
    
    // Simple performance estimation based on parameters
    let accuracy = 0.85
    let speed = 0.7
    let memory = 0.6

    // Higher estimators = better accuracy but slower
    accuracy += (nEstimators - 50) * 0.001
    speed -= (nEstimators - 50) * 0.002
    memory -= (nEstimators - 50) * 0.001

    // Higher depth = better accuracy but more memory
    accuracy += (maxDepth - 5) * 0.01
    memory -= (maxDepth - 5) * 0.02

    // Threshold affects precision/recall balance
    accuracy += Math.abs(0.7 - threshold) * 0.1

    return {
      accuracy: Math.max(0.5, Math.min(1, accuracy)),
      speed: Math.max(0.3, Math.min(1, speed)),
      memory: Math.max(0.3, Math.min(1, memory))
    }
  }

  const performance = getModelPerformance()

  return (
    <div className="space-y-6">
      {/* Model Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Konfigurasi Model AI
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Atur parameter Random Forest untuk optimasi performa
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {localModel.type}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Model Parameters */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="nEstimators" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Jumlah Pohon Keputusan
                </Label>
                <span className="text-sm font-medium">{localModel.parameters.nEstimators}</span>
              </div>
              <Slider
                value={[localModel.parameters.nEstimators]}
                onValueChange={(value) => updateModelParameter('nEstimators', value[0])}
                max={200}
                min={10}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lebih banyak pohon = akurasi lebih tinggi, tapi lebih lambat
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="maxDepth" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Kedalaman Maksimum
                </Label>
                <span className="text-sm font-medium">{localModel.parameters.maxDepth}</span>
              </div>
              <Slider
                value={[localModel.parameters.maxDepth]}
                onValueChange={(value) => updateModelParameter('maxDepth', value[0])}
                max={20}
                min={3}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kedalaman lebih tinggi = model lebih kompleks, risiko overfitting
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="threshold" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Threshold Klasifikasi
                </Label>
                <span className="text-sm font-medium">{localModel.parameters.threshold.toFixed(2)}</span>
              </div>
              <Slider
                value={[localModel.parameters.threshold]}
                onValueChange={(value) => updateModelParameter('threshold', value[0])}
                max={0.95}
                min={0.5}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Threshold tinggi = lebih konservatif, threshold rendah = lebih sensitif
              </p>
            </div>
          </div>

          <Separator />

          {/* Performance Estimation */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Estimasi Performa Model
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(performance.accuracy * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Akurasi</div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${performance.accuracy * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(performance.speed * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Kecepatan</div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${performance.speed * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(performance.memory * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Efisiensi Memori</div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${performance.memory * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Default
            </Button>
            <Button 
              onClick={saveConfiguration} 
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Simpan Konfigurasi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detection Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Parameter Deteksi
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atur bobot dan status untuk setiap parameter sensor
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parameters.map((param, index) => (
              <div key={param.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{param.displayName}</div>
                  <div className="text-sm text-muted-foreground">{param.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`weight-${param.name}`} className="text-sm">
                      Bobot:
                    </Label>
                    <Input
                      id={`weight-${param.name}`}
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={param.weight}
                      onChange={(e) => updateDetectionParameter(param.name, 'weight', parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Switch
                    checked={param.enabled}
                    onCheckedChange={(checked) => updateDetectionParameter(param.name, 'enabled', checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
