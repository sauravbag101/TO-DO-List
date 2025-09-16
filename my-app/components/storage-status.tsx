"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Trash2, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { StorageService } from "@/utils/storage"

interface StorageStatusProps {
  isAvailable: boolean
  taskCount: number
  onClearTasks: () => void
}

/**
 * Storage status component showing localStorage availability and usage
 */
export function StorageStatus({ isAvailable, taskCount, onClearTasks }: StorageStatusProps) {
  const [storageStats, setStorageStats] = useState({ used: 0, available: 0, percentage: 0 })
  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 })

  useEffect(() => {
    const updateStats = () => {
      setStorageStats(StorageService.getStorageStats())
      setTaskStats(StorageService.getTaskStats())
    }

    updateStats()
    const interval = setInterval(updateStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [taskCount])

  /**
   * Export tasks to JSON file
   */
  const handleExport = () => {
    try {
      const exportData = StorageService.exportTasks()
      const blob = new Blob([exportData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `kanban-tasks-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting tasks:", error)
      alert("Failed to export tasks. Please try again.")
    }
  }

  /**
   * Import tasks from JSON file
   */
  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const result = StorageService.importTasks(content)

          if (result.success) {
            alert(result.message)
            window.location.reload() // Refresh to show imported tasks
          } else {
            alert(`Import failed: ${result.message}`)
          }
        } catch (error) {
          console.error("Error importing tasks:", error)
          alert("Failed to import tasks. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  if (!isAvailable) {
    return (
      <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Storage Unavailable:</strong> Your tasks will not be saved between sessions. Please enable
          localStorage in your browser or use a different browser.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Storage Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Storage Active</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>
                {taskStats.total} tasks ({taskStats.todo} todo, {taskStats.inProgress} in progress, {taskStats.done}{" "}
                done)
              </span>
            </div>

            {storageStats.percentage > 80 && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                Storage {storageStats.percentage.toFixed(1)}% full
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={taskCount === 0}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>

            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>

            <Button variant="outline" size="sm" onClick={onClearTasks} disabled={taskCount === 0}>
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
