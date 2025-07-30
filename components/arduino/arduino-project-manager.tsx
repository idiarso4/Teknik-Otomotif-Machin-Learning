"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  FolderOpen, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  Upload,
  FileText,
  Calendar,
  Code,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ArduinoProject {
  id: string
  name: string
  description: string
  code: string
  pinConfig: any
  createdAt: Date
  modifiedAt: Date
  board: string
}

const SAMPLE_PROJECTS: ArduinoProject[] = [
  {
    id: "1",
    name: "Engine Temperature Monitor",
    description: "Basic engine temperature monitoring with LCD display",
    code: `// Engine Temperature Monitor
#include <LiquidCrystal.h>

const int tempPin = A0;
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Temp Monitor");
}

void loop() {
  int reading = analogRead(tempPin);
  float temp = (reading * 5.0 / 1024.0 - 0.5) * 100;
  
  lcd.setCursor(0, 1);
  lcd.print("Temp: ");
  lcd.print(temp);
  lcd.print("C");
  
  Serial.print("Temperature: ");
  Serial.println(temp);
  
  delay(1000);
}`,
    pinConfig: {},
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-20'),
    board: "Arduino Uno"
  },
  {
    id: "2",
    name: "Multi-Sensor Dashboard",
    description: "Complete automotive sensor monitoring system",
    code: `// Multi-Sensor Automotive Dashboard
#include <LiquidCrystal.h>

const int tempPin = A0;
const int pressurePin = A1;
const int voltagePin = A2;
const int rpmPin = 2;
const int buzzerPin = 8;
const int ledPin = 13;

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(rpmPin, INPUT_PULLUP);
  
  lcd.print("Multi-Sensor");
  lcd.setCursor(0, 1);
  lcd.print("Dashboard v1.0");
  delay(2000);
  lcd.clear();
}

void loop() {
  // Read all sensors
  float temp = readTemperature();
  float pressure = readPressure();
  float voltage = readVoltage();
  
  // Display on LCD
  displayData(temp, pressure, voltage);
  
  // Send to serial
  sendSerialData(temp, pressure, voltage);
  
  // Check warnings
  checkWarnings(temp, pressure, voltage);
  
  delay(1000);
}

float readTemperature() {
  int reading = analogRead(tempPin);
  return (reading * 5.0 / 1024.0 - 0.5) * 100;
}

float readPressure() {
  int reading = analogRead(pressurePin);
  return (reading * 5.0 / 1024.0) * 20;
}

float readVoltage() {
  int reading = analogRead(voltagePin);
  return (reading * 5.0 / 1024.0) * 3;
}

void displayData(float temp, float pressure, float voltage) {
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp, 1);
  lcd.print(" P:");
  lcd.print(pressure, 1);
  
  lcd.setCursor(0, 1);
  lcd.print("V:");
  lcd.print(voltage, 1);
  lcd.print("V");
}

void sendSerialData(float temp, float pressure, float voltage) {
  Serial.print("TEMP:");
  Serial.print(temp);
  Serial.print(",PRESSURE:");
  Serial.print(pressure);
  Serial.print(",VOLTAGE:");
  Serial.println(voltage);
}

void checkWarnings(float temp, float pressure, float voltage) {
  bool warning = false;
  
  if (temp > 95) {
    Serial.println("WARNING: High temperature!");
    warning = true;
  }
  
  if (pressure < 20) {
    Serial.println("WARNING: Low oil pressure!");
    warning = true;
  }
  
  if (voltage < 12.0) {
    Serial.println("WARNING: Low battery voltage!");
    warning = true;
  }
  
  if (warning) {
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000, 200);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
    pinConfig: {},
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-25'),
    board: "Arduino Uno"
  }
]

interface ArduinoProjectManagerProps {
  onProjectSelect?: (project: ArduinoProject) => void
  currentProject?: ArduinoProject | null
}

export function ArduinoProjectManager({ onProjectSelect, currentProject }: ArduinoProjectManagerProps) {
  const [projects, setProjects] = useState<ArduinoProject[]>(SAMPLE_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<ArduinoProject | null>(currentProject || null)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('arduino_projects')
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects)
        setProjects(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          modifiedAt: new Date(p.modifiedAt)
        })))
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Save projects to localStorage
    localStorage.setItem('arduino_projects', JSON.stringify(projects))
  }, [projects])

  const createNewProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      })
      return
    }

    const newProject: ArduinoProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      code: `// ${newProjectName}
// Created: ${new Date().toLocaleDateString()}

void setup() {
  Serial.begin(9600);
  // Initialize your code here
}

void loop() {
  // Main program loop
  delay(1000);
}`,
      pinConfig: {},
      createdAt: new Date(),
      modifiedAt: new Date(),
      board: "Arduino Uno"
    }

    setProjects(prev => [newProject, ...prev])
    setSelectedProject(newProject)
    setIsCreating(false)
    setNewProjectName("")
    setNewProjectDescription("")
    
    if (onProjectSelect) {
      onProjectSelect(newProject)
    }

    toast({
      title: "Project Created",
      description: `${newProjectName} has been created`,
      variant: "success"
    })
  }

  const selectProject = (project: ArduinoProject) => {
    setSelectedProject(project)
    if (onProjectSelect) {
      onProjectSelect(project)
    }
    toast({
      title: "Project Loaded",
      description: `${project.name} has been loaded`,
      variant: "success"
    })
  }

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    setProjects(prev => prev.filter(p => p.id !== projectId))
    
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
    }

    toast({
      title: "Project Deleted",
      description: `${project.name} has been deleted`,
      variant: "default"
    })
  }

  const exportProject = (project: ArduinoProject) => {
    const exportData = {
      ...project,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Project Exported",
      description: `${project.name} has been exported`,
      variant: "success"
    })
  }

  const importProject = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedProject = JSON.parse(e.target?.result as string)
            const newProject: ArduinoProject = {
              ...importedProject,
              id: Date.now().toString(),
              createdAt: new Date(importedProject.createdAt),
              modifiedAt: new Date(),
            }
            
            setProjects(prev => [newProject, ...prev])
            toast({
              title: "Project Imported",
              description: `${newProject.name} has been imported`,
              variant: "success"
            })
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid project file format",
              variant: "destructive"
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Arduino Project Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Arduino projects and code
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={importProject}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Create New Project */}
        {isCreating && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Create New Project</h4>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Input
                id="projectDescription"
                placeholder="Enter project description..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createNewProject}>
                <Save className="h-4 w-4 mr-2" />
                Create Project
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Current Project */}
        {selectedProject && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Current Project</h4>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="space-y-1">
              <div className="font-medium">{selectedProject.name}</div>
              <div className="text-sm text-muted-foreground">{selectedProject.description}</div>
              <div className="text-xs text-muted-foreground">
                Modified: {selectedProject.modifiedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Projects List */}
        <div>
          <h4 className="font-medium mb-3">All Projects ({projects.length})</h4>
          <div className="space-y-2">
            {projects.map((project) => (
              <div 
                key={project.id}
                className={cn(
                  "border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                  selectedProject?.id === project.id && "border-primary bg-primary/5"
                )}
                onClick={() => selectProject(project)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{project.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {project.board}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {project.description || "No description"}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.modifiedAt.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {project.code.split('\n').length} lines
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        exportProject(project)
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {projects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects yet</p>
            <p className="text-sm">Create your first Arduino project to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
