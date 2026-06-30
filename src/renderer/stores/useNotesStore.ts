import { create } from 'zustand'
import { Note } from '../types'

interface NotesState {
  notes: Note[]
  currentNote: Note | null
  loading: boolean
  searchQuery: string
  currentFolderId: string | null
  fetchNotes: () => Promise<void>
  fetchNotesInFolder: (folderId: string | null) => Promise<void>
  setCurrentNote: (note: Note | null) => void
  setCurrentFolderId: (folderId: string | null) => void
  createNote: (title?: string, folderId?: string | null) => Promise<Note>
  updateNote: (id: string, data: Partial<Pick<Note, 'title' | 'body' | 'font_size' | 'color' | 'folder_id'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  searchNotes: (query: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  searchQuery: '',
  currentFolderId: null,

  fetchNotes: async () => {
    set({ loading: true })
    try {
      const list = await window.opsidian.notes.list()
      set({ notes: list })
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchNotesInFolder: async (folderId) => {
    set({ currentFolderId: folderId })
    // Don't filter notes - we need to show all notes in the tree
    // Just update the current folder selection
  },

  setCurrentNote: (note) => {
    set({ currentNote: note })
  },

  setCurrentFolderId: (folderId) => {
    set({ currentFolderId: folderId })
  },

  createNote: async (title, folderId = null) => {
    const note = await window.opsidian.notes.create({ 
      title, 
      folder_id: folderId !== undefined ? folderId : get().currentFolderId 
    })
    set((state) => ({
      notes: [note, ...state.notes],
      currentNote: note
    }))
    return note
  },

  updateNote: async (id, data) => {
    try {
      const updated = await window.opsidian.notes.update(id, data)
      set((state) => {
        const notes = state.notes.map((n) => (n.id === id ? updated : n))
        const currentNote = state.currentNote?.id === id ? updated : state.currentNote
        return { notes, currentNote }
      })
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  },

  deleteNote: async (id) => {
    try {
      await window.opsidian.notes.delete(id)
      set((state) => {
        const notes = state.notes.filter((n) => n.id !== id)
        const currentNote = state.currentNote?.id === id ? null : state.currentNote
        return { notes, currentNote }
      })
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery })
  },

  searchNotes: async (query) => {
    if (!query.trim()) {
      await get().fetchNotes()
      return
    }
    set({ loading: true })
    try {
      const results = await window.opsidian.notes.search(query)
      set({ notes: results })
    } catch (err) {
      console.error('Failed to search notes:', err)
    } finally {
      set({ loading: false })
    }
  }
}))
