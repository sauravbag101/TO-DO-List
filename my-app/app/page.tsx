import { KanbanBoard } from "@/components/kanban-board"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl  text-foreground mb-2">Dynamic Saurav Bag Board</h1>
          <p className="text-muted-foreground text-lg">Organize your tasks with drag-and-drop functionality</p>
        </header>
        <KanbanBoard />
      </div>
    </main>
  )
}
