import { create } from 'zustand'
import { Task, KanbanStatus } from '../types'

interface TasksState {
  tasks: Task[]
  loading: boolean
  fetchTasks: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  reorderTask: (id: string, position: number, status?: KanbanStatus) => Promise<void>
  completeTask: (id: string, targetStatus?: 'done' | 'skipped') => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const list = await window.opsidian.tasks.list()
      set({ tasks: list })
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      set({ loading: false })
    }
  },

  createTask: async (data) => {
    const task = await window.opsidian.tasks.create(data)
    set((state) => ({ tasks: [...state.tasks, task] }))
    return task
  },

  updateTask: async (id, data) => {
    try {
      const updated = await window.opsidian.tasks.update(id, data)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t))
      }))
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  },

  reorderTask: async (id, position, status) => {
    // Optimistic UI update
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            kanban_position: position,
            status: status || t.status
          }
        }
        return t
      })
    }))

    try {
      const updated = await window.opsidian.tasks.reorder(id, position, status)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t))
      }))
    } catch (err) {
      console.error('Failed to reorder task:', err)
      // Rollback to fetch state if fails
      const list = await window.opsidian.tasks.list()
      set({ tasks: list })
    }
  },

  completeTask: async (id, targetStatus = 'done') => {
    try {
      const result = await window.opsidian.tasks.complete(id, targetStatus)
      set((state) => {
        let tasks = state.tasks.map((t) => (t.id === id ? result.completed : t))
        if (result.next) {
          tasks = [...tasks, result.next]
        }
        return { tasks }
      })
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  },

  deleteTask: async (id) => {
    try {
      await window.opsidian.tasks.delete(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }
}))
