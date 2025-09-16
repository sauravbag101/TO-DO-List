"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import type { Task, TaskStatus } from "@/types/task"
import { DragDropService } from "@/utils/drag-drop"

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDrop: (status: TaskStatus) => void
  onDeleteTask: (taskId: string) => void
  draggedTask: Task | null
}

/**
 * Kanban column component with enhanced drag and drop feedback
 * Represents a single column in the Kanban board (To Do, In Progress, Done)
 */
export function KanbanColumn({
  title,
  status,
  tasks,
  onDragStart,
  onDragEnd,
  onDrop,
  onDeleteTask,
  draggedTask,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverCounter, setDragOverCounter] = useState(0)
  const columnRef = useRef<HTMLDivElement>(null)

  /**
   * Handle drag over event with improved detection
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"

    if (!isDragOver) {
      setIsDragOver(true)
    }
  }

  /**
   * Handle drag enter event with counter to prevent flickering
   */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverCounter((prev) => prev + 1)

    if (!isDragOver) {
      setIsDragOver(true)
      if (columnRef.current) {
        DragDropService.addDragOverEffect(columnRef.current)
      }
    }
  }

  /**
   * Handle drag leave event with counter
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverCounter((prev) => {
      const newCounter = prev - 1

      if (newCounter <= 0) {
        setIsDragOver(false)
        if (columnRef.current) {
          DragDropService.removeDragOverEffect(columnRef.current)
        }
        return 0
      }

      return newCounter
    })
  }

  /**
   * Handle drop event with animation
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    setDragOverCounter(0)

    if (columnRef.current) {
      DragDropService.removeDragOverEffect(columnRef.current)
    }

    const taskId = e.dataTransfer.getData("text/plain")
    const taskData = e.dataTransfer.getData("application/json")

    if (taskId && taskData) {
      try {
        const task = JSON.parse(taskData)

        // Only proceed if the task is being moved to a different column
        if (task.status !== status) {
          onDrop(status)

          // Add a subtle success animation
          if (columnRef.current) {
            columnRef.current.style.transform = "scale(1.02)"
            setTimeout(() => {
              if (columnRef.current) {
                columnRef.current.style.transform = ""
              }
            }, 150)
          }
        }
      } catch (error) {
        console.error("Error parsing dropped task data:", error)
        onDrop(status) // Fallback to basic drop handling
      }
    }
  }

  /**
   * Get column-specific styling and status indicators
   */
  const getColumnColor = () => {
    switch (status) {
      case "todo":
        return "text-blue-600 dark:text-blue-400"
      case "in-progress":
        return "text-amber-600 dark:text-amber-400"
      case "done":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-primary"
    }
  }

  const getColumnBorderColor = () => {
    switch (status) {
      case "todo":
        return "border-blue-200 dark:border-blue-800"
      case "in-progress":
        return "border-amber-200 dark:border-amber-800"
      case "done":
        return "border-green-200 dark:border-green-800"
      default:
        return "border-border"
    }
  }

  return (
    <Card
      ref={columnRef}
      className={`group h-fit min-h-[400px] transition-all duration-200 ${
        isDragOver ? "bg-primary/5 border-primary shadow-lg scale-[1.02]" : `bg-muted/30 ${getColumnBorderColor()}`
      }`}
      data-status={status}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-4">
        <CardTitle className={`text-lg font-bold ${getColumnColor()} flex items-center justify-between`}>
          <span className="flex items-center gap-2">
            {title}
            {isDragOver && draggedTask && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full animate-pulse">
                Drop here
              </span>
            )}
          </span>
          <span className="text-sm font-normal bg-muted text-muted-foreground px-2 py-1 rounded-full transition-colors">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div
            className={`text-center py-8 text-muted-foreground transition-all duration-200 ${
              isDragOver ? "text-primary" : ""
            }`}
          >
            <p className="text-sm font-medium">{isDragOver ? "Drop task here" : "No tasks yet"}</p>
            <p className="text-xs mt-1">
              {isDragOver ? "Release to move task" : status === "todo" ? "Add a new task above" : "Drag tasks here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="group">
                <TaskCard
                  task={task}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDelete={onDeleteTask}
                  isDragging={draggedTask?.id === task.id}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
