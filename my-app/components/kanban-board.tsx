"use client"

import { useState, useEffect } from "react"
import { TaskForm } from "./task-form"
import { KanbanColumn } from "./kanban-column"
import { StorageStatus } from "./storage-status"
import type { Task, TaskStatus } from "@/types/task"
import { StorageService } from "@/utils/storage"

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [storageAvailable, setStorageAvailable] = useState(true)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        setIsLoading(true)

        // Check if storage is available
        if (!StorageService.isStorageAvailable()) {
          setStorageAvailable(false)
          console.warn("localStorage is not available. Tasks will not persist.")
          return
        }

        const savedTasks = StorageService.getTasks()
        setTasks(savedTasks)
        console.log(`Loaded ${savedTasks.length} tasks from localStorage`)
      } catch (error) {
        console.error("Error loading tasks:", error)
        setStorageAvailable(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading && storageAvailable) {
      try {
        StorageService.saveTasks(tasks)
        console.log(`Saved ${tasks.length} tasks to localStorage`)
      } catch (error) {
        console.error("Error saving tasks:", error)
      }
    }
  }, [tasks, isLoading, storageAvailable])

  /**
   * Add a new task to the "To Do" column
   */
  const addTask = (title: string, description: string) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      status: "todo",
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  /**
   * Update task status when moved between columns
   */
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          console.log(`Moving task "${task.title}" from ${task.status} to ${newStatus}`)
          return { ...task, status: newStatus }
        }
        return task
      }),
    )
  }

  /**
   * Delete a task
   */
  const deleteTask = (taskId: string) => {
    setTasks((prev) => {
      const taskToDelete = prev.find((task) => task.id === taskId)
      if (taskToDelete) {
        console.log(`Deleting task: "${taskToDelete.title}"`)
      }
      return prev.filter((task) => task.id !== taskId)
    })
  }

  /**
   * Handle drag start
   */
  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
    console.log(`Started dragging task: "${task.title}"`)
  }

  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    if (draggedTask) {
      console.log(`Finished dragging task: "${draggedTask.title}"`)
    }
    setDraggedTask(null)
  }

  /**
   * Handle drop on column
   */
  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status)
    }
    setDraggedTask(null)
  }

  /**
   * Clear all tasks (for testing/demo purposes)
   */
  const clearAllTasks = () => {
    if (window.confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
      setTasks([])
      StorageService.clearTasks()
      console.log("Cleared all tasks")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  // Filter tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  return (
    <div className="space-y-8">
      {/* Storage Status */}
      <StorageStatus isAvailable={storageAvailable} taskCount={tasks.length} onClearTasks={clearAllTasks} />

      {/* Task Creation Form */}
      <TaskForm onAddTask={addTask} />

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDeleteTask={deleteTask}
          draggedTask={draggedTask}
        />
        <KanbanColumn
          title="In Progress"
          status="in-progress"
          tasks={inProgressTasks}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDeleteTask={deleteTask}
          draggedTask={draggedTask}
        />
        <KanbanColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDeleteTask={deleteTask}
          draggedTask={draggedTask}
        />
      </div>
    </div>
  )
}
