import { create } from 'zustand'
import { CalendarEvent } from '../types'

interface EventsState {
  events: CalendarEvent[]
  loading: boolean
  fetchEvents: (start: string, end: string) => Promise<void>
  createEvent: (data: Partial<CalendarEvent>) => Promise<CalendarEvent>
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  loading: false,

  fetchEvents: async (start, end) => {
    set({ loading: true })
    try {
      const list = await window.opsidian.events.list(start, end)
      set({ events: list })
    } catch (err) {
      console.error('Failed to fetch events:', err)
    } finally {
      set({ loading: false })
    }
  },

  createEvent: async (data) => {
    const event = await window.opsidian.events.create(data)
    set((state) => ({ events: [...state.events, event] }))
    return event
  },

  updateEvent: async (id, data) => {
    try {
      const updated = await window.opsidian.events.update(id, data)
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updated : e))
      }))
    } catch (err) {
      console.error('Failed to update event:', err)
    }
  },

  deleteEvent: async (id) => {
    try {
      await window.opsidian.events.delete(id)
      set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      }))
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }
}))
