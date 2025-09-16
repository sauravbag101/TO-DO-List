"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, GripVertical } from "lucide-react"
import type { Task } from "@/types/task"
import { DragDropService } from "@/utils/drag-drop"

interface TaskCardProps {
  task: Task
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDelete: (taskId: string) => void
  isDragging?: boolean
}

/**
 * Individual task card component
 * Displays task information and handles drag operations with enhanced visual feedback
 */
export function TaskCard({ task, onDragStart, onDragEnd, onDelete, isDragging }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  /**
   * Handle task deletion with confirmation
   */
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true)
      try {
        onDelete(task.id)
      } catch (error) {
        console.error("Error deleting task:", error)
        setIsDeleting(false)
      }
    }
  }

  /**
   * Handle drag start event with enhanced visual feedback
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
    e.dataTransfer.setData("application/json", JSON.stringify(task))

    // Create custom drag image for better visual feedback
    if (cardRef.current) {
      const dragImage = DragDropService.createDragImage(cardRef.current, task.title)
      e.dataTransfer.setDragImage(dragImage, 0, 0)
    }

    // Add visual feedback with slight delay to avoid flickering
    const element = e.currentTarget
    setTimeout(() => {
      DragDropService.addDraggingEffect(element)
    }, 0)

    onDragStart(task)
  }

  /**
   * Handle drag end event
   */
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    DragDropService.removeDraggingEffect(element)
    onDragEnd()
  }

  /**
   * Handle mouse down for potential drag operation
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    // Add slight scale effect on mouse down for better feedback
    if (cardRef.current) {
      cardRef.current.style.transform = "scale(0.98)"
    }
  }

  /**
   * Handle mouse up
   */
  const handleMouseUp = (e: React.MouseEvent) => {
    // Reset scale effect
    if (cardRef.current) {
      cardRef.current.style.transform = ""
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card
      ref={cardRef}
      className={`task-card bg-card border-border cursor-move select-none transition-all duration-200 ${
        isDragging ? "opacity-50 scale-105" : ""
      } ${isDeleting ? "opacity-50" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Reset on mouse leave too
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-60" />
            <h3 className="font-semibold text-card-foreground text-sm leading-tight break-words">{task.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {task.description && (
        <CardContent className="pt-0 pb-2">
          <p className="text-xs text-muted-foreground leading-relaxed break-words">{task.description}</p>
        </CardContent>
      )}

      <CardContent className="pt-0 pb-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
