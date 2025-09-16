"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface TaskFormProps {
  onAddTask: (title: string, description: string) => void
}

/**
 * Task creation form component
 * Provides a clean interface for adding new tasks to the Kanban board
 */
export function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Add the task
      onAddTask(title.trim(), description.trim())

      // Reset form
      setTitle("")
      setDescription("")
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium text-card-foreground">
              Task Title *
            </label>
            <Input
              id="task-title"
              type="text"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium text-card-foreground">
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="Enter task description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isSubmitting ? "Adding Task..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
