"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Terminal, 
  Play, 
  Square, 
  Trash2, 
  Download, 
  Send,
  Settings,
  Zap,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SerialMessage {
  id: number
  timestamp: Date
  type: 'sent' | 'received' | 'system'
  message: string
}

const BAUD_RATES = [
  300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200
]

export function SerialMonitor() {
  const [isConnected, setIsConnected] = useState(false)
  const [baudRate, setBaudRate] = useState(9600)
  const [messages, setMessages] = useState<SerialMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [autoScroll, setAutoScroll] = useState(true)
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Simulate Arduino serial data
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      // Simulate sensor data from Arduino
      const sensorData = generateSensorData()
      addMessage('received', sensorData)
      
      // Occasionally add system messages
      if (Math.random() < 0.1) {
        const systemMessages = [
          "System initialized",
          "Sensors calibrated",
          "Warning: Temperature threshold exceeded",
          "Oil pressure normal",
          "Battery voltage OK"
        ]
        const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
        addMessage('system', randomMessage)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  const generateSensorData = () => {
    const temp = (80 + Math.random() * 20).toFixed(1)
    const pressure = (40 + Math.random() * 20).toFixed(1)
    const voltage = (12.0 + Math.random() * 1.0).toFixed(2)
    const rpm = Math.floor(2000 + Math.random() * 2000)
    
    return `TEMP:${temp},PRESSURE:${pressure},VOLTAGE:${voltage},RPM:${rpm}`
  }

  const addMessage = (type: SerialMessage['type'], message: string) => {
    const newMessage: SerialMessage = {
      id: messageCount,
      timestamp: new Date(),
      type,
      message
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessageCount(prev => prev + 1)
  }

  const handleConnect = () => {
    if (isConnected) {
      setIsConnected(false)
      addMessage('system', `Disconnected from COM port (${baudRate} baud)`)
      toast({
        title: "Disconnected",
        description: "Serial monitor disconnected",
        variant: "default"
      })
    } else {
      setIsConnected(true)
      addMessage('system', `Connected to COM3 at ${baudRate} baud`)
      addMessage('system', "Arduino Automotive Monitor v1.0")
      addMessage('system', "Initializing sensors...")
      toast({
        title: "Connected",
        description: `Serial monitor connected at ${baudRate} baud`,
        variant: "success"
      })
    }
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return
    
    addMessage('sent', inputMessage)
    
    // Simulate Arduino response
    setTimeout(() => {
      if (inputMessage.toLowerCase().includes('status')) {
        addMessage('received', 'System Status: OK - All sensors operational')
      } else if (inputMessage.toLowerCase().includes('reset')) {
        addMessage('system', 'System reset initiated...')
        addMessage('system', 'Reboot complete')
      } else {
        addMessage('received', `Echo: ${inputMessage}`)
      }
    }, 500)
    
    setInputMessage("")
  }

  const handleClearMessages = () => {
    setMessages([])
    setMessageCount(0)
    toast({
      title: "Messages Cleared",
      description: "Serial monitor cleared",
      variant: "default"
    })
  }

  const handleExportLog = () => {
    const logContent = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.message}`
    ).join('\n')
    
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `serial_log_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Log Exported",
      description: "Serial log saved to file",
      variant: "success"
    })
  }

  const getMessageTypeColor = (type: SerialMessage['type']) => {
    switch (type) {
      case 'sent': return 'text-blue-600 dark:text-blue-400'
      case 'received': return 'text-green-600 dark:text-green-400'
      case 'system': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-foreground'
    }
  }

  const getMessageTypeIcon = (type: SerialMessage['type']) => {
    switch (type) {
      case 'sent': return '→'
      case 'received': return '←'
      case 'system': return '●'
      default: return '•'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Serial Monitor
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Arduino serial communication debugger
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={baudRate.toString()}
            onValueChange={(value) => setBaudRate(parseInt(value))}
            disabled={isConnected}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BAUD_RATES.map(rate => (
                <SelectItem key={rate} value={rate.toString()}>
                  {rate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={isConnected ? "destructive" : "default"}
            size="sm"
            onClick={handleConnect}
          >
            {isConnected ? (
              <Square className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "secondary"}>
              <Zap className="h-3 w-3 mr-1" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {baudRate} baud
            </span>
            <span className="text-sm text-muted-foreground">
              {messages.length} messages
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportLog}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearMessages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Messages Display */}
        <div className="border rounded-md">
          <div 
            className="h-[300px] overflow-y-auto p-3 bg-black text-green-400 font-mono text-sm"
            style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <Terminal className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet</p>
                <p className="text-xs">Connect to start monitoring</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="mb-1 flex items-start gap-2">
                  <span className="text-gray-400 text-xs min-w-[80px]">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={cn("text-xs", getMessageTypeColor(message.type))}>
                    {getMessageTypeIcon(message.type)}
                  </span>
                  <span className="flex-1 break-all">
                    {message.message}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <Input
            placeholder={isConnected ? "Enter command..." : "Connect to send messages"}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>

        {/* Quick Commands */}
        {isConnected && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">Quick Commands:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Status", command: "status" },
                  { label: "Reset", command: "reset" },
                  { label: "Calibrate", command: "calibrate" },
                  { label: "Test", command: "test sensors" }
                ].map((cmd) => (
                  <Button
                    key={cmd.command}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage(cmd.command)
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                  >
                    {cmd.label}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium text-blue-600">
              {messages.filter(m => m.type === 'sent').length}
            </div>
            <div className="text-muted-foreground">Sent</div>
          </div>
          <div>
            <div className="font-medium text-green-600">
              {messages.filter(m => m.type === 'received').length}
            </div>
            <div className="text-muted-foreground">Received</div>
          </div>
          <div>
            <div className="font-medium text-yellow-600">
              {messages.filter(m => m.type === 'system').length}
            </div>
            <div className="text-muted-foreground">System</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
