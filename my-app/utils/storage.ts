import type { Task } from "@/types/task"

/**
 * Storage service for managing tasks in localStorage
 * Provides a clean interface for persistence operations with enhanced error handling
 */
export class StorageService {
  private static readonly STORAGE_KEY = "kanban-tasks"
  private static readonly STORAGE_VERSION = "1.0"
  private static readonly VERSION_KEY = "kanban-version"

  /**
   * Retrieve tasks from localStorage with data validation
   * @returns Array of tasks or empty array if none found
   */
  static getTasks(): Task[] {
    try {
      if (typeof window === "undefined") return []

      // Check storage version for compatibility
      const version = localStorage.getItem(this.VERSION_KEY)
      if (version && version !== this.STORAGE_VERSION) {
        console.warn("Storage version mismatch, clearing old data")
        this.clearTasks()
        return []
      }

      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)

      // Validate data structure
      if (!Array.isArray(parsed)) {
        console.warn("Invalid task data structure, clearing storage")
        this.clearTasks()
        return []
      }

      // Validate each task object
      const validTasks = parsed.filter(this.isValidTask)

      // If some tasks were invalid, save the cleaned data
      if (validTasks.length !== parsed.length) {
        console.warn(`Removed ${parsed.length - validTasks.length} invalid tasks`)
        this.saveTasks(validTasks)
      }

      return validTasks
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error)
      this.clearTasks() // Clear corrupted data
      return []
    }
  }

  /**
   * Save tasks to localStorage with version tracking
   * @param tasks - Array of tasks to save
   */
  static saveTasks(tasks: Task[]): void {
    try {
      if (typeof window === "undefined") return

      // Validate tasks before saving
      const validTasks = tasks.filter(this.isValidTask)

      if (validTasks.length !== tasks.length) {
        console.warn(`Filtered out ${tasks.length - validTasks.length} invalid tasks before saving`)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validTasks))
      localStorage.setItem(this.VERSION_KEY, this.STORAGE_VERSION)
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error)

      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        console.error("localStorage quota exceeded. Consider implementing data cleanup.")
        this.showStorageQuotaWarning()
      }
    }
  }

  /**
   * Clear all tasks from localStorage
   */
  static clearTasks(): void {
    try {
      if (typeof window === "undefined") return

      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.VERSION_KEY)
    } catch (error) {
      console.error("Error clearing tasks from localStorage:", error)
    }
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): { used: number; available: number; percentage: number } {
    try {
      if (typeof window === "undefined") {
        return { used: 0, available: 0, percentage: 0 }
      }

      const stored = localStorage.getItem(this.STORAGE_KEY) || ""
      const used = new Blob([stored]).size
      const available = 5 * 1024 * 1024 // Approximate 5MB limit for localStorage

      return {
        used,
        available,
        percentage: (used / available) * 100,
      }
    } catch (error) {
      console.error("Error calculating storage stats:", error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  /**
   * Export tasks as JSON for backup
   */
  static exportTasks(): string {
    const tasks = this.getTasks()
    return JSON.stringify(
      {
        version: this.STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        tasks,
      },
      null,
      2,
    )
  }

  /**
   * Import tasks from JSON backup
   */
  static importTasks(jsonData: string): { success: boolean; message: string; tasksImported: number } {
    try {
      const data = JSON.parse(jsonData)

      if (!data.tasks || !Array.isArray(data.tasks)) {
        return { success: false, message: "Invalid backup format", tasksImported: 0 }
      }

      const validTasks = data.tasks.filter(this.isValidTask)

      if (validTasks.length === 0) {
        return { success: false, message: "No valid tasks found in backup", tasksImported: 0 }
      }

      // Merge with existing tasks (avoid duplicates by ID)
      const existingTasks = this.getTasks()
      const existingIds = new Set(existingTasks.map((task) => task.id))
      const newTasks = validTasks.filter((task: Task) => !existingIds.has(task.id))

      const mergedTasks = [...existingTasks, ...newTasks]
      this.saveTasks(mergedTasks)

      return {
        success: true,
        message: `Successfully imported ${newTasks.length} tasks`,
        tasksImported: newTasks.length,
      }
    } catch (error) {
      console.error("Error importing tasks:", error)
      return { success: false, message: "Failed to parse backup file", tasksImported: 0 }
    }
  }

  /**
   * Validate task object structure
   */
  private static isValidTask(task: any): task is Task {
    return (
      task &&
      typeof task === "object" &&
      typeof task.id === "string" &&
      typeof task.title === "string" &&
      typeof task.description === "string" &&
      typeof task.status === "string" &&
      ["todo", "in-progress", "done"].includes(task.status) &&
      typeof task.createdAt === "string" &&
      !isNaN(Date.parse(task.createdAt))
    )
  }

  /**
   * Show storage quota warning to user
   */
  private static showStorageQuotaWarning(): void {
    if (typeof window !== "undefined") {
      console.warn(
        "localStorage is full. Consider exporting your tasks and clearing old data, or use a different storage solution.",
      )
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      if (typeof window === "undefined") return false

      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get task count by status
   */
  static getTaskStats(): { todo: number; inProgress: number; done: number; total: number } {
    const tasks = this.getTasks()
    return {
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      done: tasks.filter((task) => task.status === "done").length,
      total: tasks.length,
    }
  }
}
