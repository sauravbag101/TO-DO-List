export type TaskStatus = "todo" | "in-progress" | "done"

/**
 * Task interface defining the structure of a task
 */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
}
