"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAIDetection } from "@/lib/hooks/use-ai-detection"
import { DetectionResult, DetectionStatus } from "@/lib/types/ai-detection"
import { 
  History,
  Search,
  Filter,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOptions {
  status: DetectionStatus | 'all'
  parameter: string
  dateRange: 'today' | 'week' | 'month' | 'all'
  search: string
}

export function DetectionHistoryTable() {
  const { results, loadHistoricalResults } = useAIDetection()
  const [filteredResults, setFilteredResults] = useState<DetectionResult[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    parameter: 'all',
    dateRange: 'all',
    search: ''
  })

  useEffect(() => {
    loadHistoricalResults()
  }, [loadHistoricalResults])

  useEffect(() => {
    let filtered = [...results]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(result => result.status === filters.status)
    }

    // Filter by parameter
    if (filters.parameter !== 'all') {
      filtered = filtered.filter(result => result.parameter === filters.parameter)
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(result => result.timestamp >= cutoffDate)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(result => 
        result.parameter.toLowerCase().includes(searchLower) ||
        result.recommendation.toLowerCase().includes(searchLower)
      )
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setFilteredResults(filtered)
    setCurrentPage(1)
  }, [results, filters])

  const getStatusDisplay = (status: DetectionStatus) => {
    switch (status) {
      case 'critical':
        return {
          color: 'destructive' as const,
          icon: <XCircle className="h-3 w-3" />,
          text: 'KRITIS'
        }
      case 'warning':
        return {
          color: 'secondary' as const,
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'PERINGATAN'
        }
      default:
        return {
          color: 'default' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'NORMAL'
        }
    }
  }

  const getParameterName = (parameter: string) => {
    const names: Record<string, string> = {
      'engineTemp': 'Suhu Mesin',
      'oilPressure': 'Tekanan Oli',
      'batteryVoltage': 'Voltase Baterai',
      'engineRPM': 'RPM Mesin',
      'engineVibration': 'Getaran Mesin'
    }
    return names[parameter] || parameter
  }

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Parameter', 'Status', 'Confidence', 'Recommendation']
    const csvData = filteredResults.map(result => [
      result.timestamp.toLocaleString('id-ID'),
      getParameterName(result.parameter),
      result.status,
      (result.confidence * 100).toFixed(1) + '%',
      result.recommendation.replace(/,/g, ';') // Replace commas to avoid CSV issues
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ai-detection-history-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResults = filteredResults.slice(startIndex, endIndex)

  const uniqueParameters = Array.from(new Set(results.map(r => r.parameter)))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Deteksi AI
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredResults.length} dari {results.length} hasil deteksi
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari parameter atau rekomendasi..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as DetectionStatus | 'all' }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="critical">Kritis</SelectItem>
              <SelectItem value="warning">Peringatan</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.parameter}
            onValueChange={(value) => setFilters(prev => ({ ...prev, parameter: value }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Parameter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Parameter</SelectItem>
              {uniqueParameters.map(param => (
                <SelectItem key={param} value={param}>
                  {getParameterName(param)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as FilterOptions['dateRange'] }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">7 Hari</SelectItem>
              <SelectItem value="month">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {currentResults.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Waktu</th>
                      <th className="text-left p-3 font-medium">Parameter</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Kepercayaan</th>
                      <th className="text-left p-3 font-medium">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResults.map((result, index) => {
                      const statusDisplay = getStatusDisplay(result.status)
                      return (
                        <tr key={index} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {result.timestamp.toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium">
                            {getParameterName(result.parameter)}
                          </td>
                          <td className="p-3">
                            <Badge variant={statusDisplay.color} className="flex items-center gap-1 w-fit">
                              {statusDisplay.icon}
                              {statusDisplay.text}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className={cn("h-2 rounded-full", {
                                    "bg-red-500": result.confidence > 0.8,
                                    "bg-yellow-500": result.confidence > 0.6 && result.confidence <= 0.8,
                                    "bg-green-500": result.confidence <= 0.6
                                  })}
                                  style={{ width: `${result.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm max-w-xs">
                            <div className="truncate" title={result.recommendation}>
                              {result.recommendation}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredResults.length)} dari {filteredResults.length} hasil
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada hasil deteksi yang sesuai dengan filter</p>
            <p className="text-sm">Coba ubah kriteria pencarian atau filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
