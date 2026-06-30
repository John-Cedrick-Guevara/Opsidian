// ============================================================
// Core entity types
// ============================================================

export interface Note {
  id: string
  title: string
  body: string // Tiptap JSON doc string
  font_size: number | null
  color: string | null
  folder_id: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  parent_id: string | null
  is_expanded: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string // Tiptap JSON doc string
  status: 'todo' | 'doing' | 'done' | 'skipped'
  kanban_position: number
  recurrence_rule: string | null
  due_date: string | null
  linked_note_id: string | null
  tags: string
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  source_type: 'note' | 'task' | 'event'
  source_id: string
  target_type: 'note' | 'task' | 'event'
  target_id: string
  created_at: string
  // Computed fields from query
  linked_type?: string
  linked_id?: string
}

export interface CalendarEvent {
  id: string
  title: string
  start_at: string
  end_at: string
  all_day: boolean
  linked_note_id: string | null
  linked_task_id: string | null
  recurrence_rule: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Graph types
// ============================================================

export interface GraphNode {
  id: string
  title: string
  type: 'note' | 'task' | 'event'
  status?: string
  updated_at: string
  // d3-force simulation fields
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  id: string
  source_type: string
  source_id: string
  target_type: string
  target_id: string
  // d3-force fields
  source: string | number | GraphNode
  target: string | number | GraphNode
}

// ============================================================
// View types
// ============================================================

export type AppView = 'notes' | 'graph' | 'kanban' | 'calendar'

export type KanbanStatus = 'todo' | 'doing' | 'done' | 'skipped'

export const KANBAN_COLUMNS: { key: KanbanStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'var(--text-tertiary)' },
  { key: 'doing', label: 'Doing', color: 'var(--amber)' },
  { key: 'done', label: 'Done', color: 'var(--green)' },
  { key: 'skipped', label: 'Skipped', color: 'var(--rose)' },
]

// ============================================================
// API type (window.opsidian)
// ============================================================

export interface OpsidianAPI {
  notes: {
    list(): Promise<Note[]>
    get(id: string): Promise<Note>
    create(data: Partial<Note>): Promise<Note>
    update(id: string, data: Partial<Note>): Promise<Note>
    delete(id: string): Promise<void>
    search(query: string): Promise<Note[]>
  }
  folders: {
    list(): Promise<Folder[]>
    get(id: string): Promise<Folder>
    create(data: Partial<Folder>): Promise<Folder>
    update(id: string, data: Partial<Folder>): Promise<Folder>
    delete(id: string): Promise<void>
    getNotes(folderId: string | null): Promise<Note[]>
  }
  tasks: {
    list(filter?: { status?: string }): Promise<Task[]>
    get(id: string): Promise<Task>
    create(data: Partial<Task>): Promise<Task>
    update(id: string, data: Partial<Task>): Promise<Task>
    delete(id: string): Promise<void>
    reorder(id: string, position: number, status?: string): Promise<Task>
    complete(id: string, targetStatus?: 'done' | 'skipped'): Promise<{ completed: Task; next?: Task }>
  }
  links: {
    create(source: { type: string; id: string }, target: { type: string; id: string }): Promise<Link>
    delete(id: string): Promise<void>
    getForEntity(type: string, id: string): Promise<Link[]>
    getGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>
  }
  events: {
    list(start: string, end: string): Promise<CalendarEvent[]>
    get(id: string): Promise<CalendarEvent>
    create(data: Partial<CalendarEvent>): Promise<CalendarEvent>
    update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent>
    delete(id: string): Promise<void>
    importIcs(): Promise<{ imported: number }>
  }
}

declare global {
  interface Window {
    opsidian: OpsidianAPI
  }
}
