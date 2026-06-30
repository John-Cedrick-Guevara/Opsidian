import { create } from 'zustand'
import { Folder } from '../types'

interface FoldersState {
  folders: Folder[]
  loading: boolean
  fetchFolders: () => Promise<void>
  createFolder: (name: string, parentId?: string | null) => Promise<Folder>
  updateFolder: (id: string, data: Partial<Pick<Folder, 'name' | 'parent_id' | 'is_expanded'>>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  toggleExpanded: (id: string) => Promise<void>
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  loading: false,

  fetchFolders: async () => {
    set({ loading: true })
    try {
      const list = await window.opsidian.folders.list()
      set({ folders: list })
    } catch (err) {
      console.error('Failed to fetch folders:', err)
    } finally {
      set({ loading: false })
    }
  },

  createFolder: async (name, parentId = null) => {
    const folder = await window.opsidian.folders.create({ name, parent_id: parentId })
    set((state) => ({
      folders: [...state.folders, folder]
    }))
    return folder
  },

  updateFolder: async (id, data) => {
    try {
      const updated = await window.opsidian.folders.update(id, data)
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updated : f))
      }))
    } catch (err) {
      console.error('Failed to update folder:', err)
    }
  },

  deleteFolder: async (id) => {
    try {
      await window.opsidian.folders.delete(id)
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id && f.parent_id !== id)
      }))
    } catch (err) {
      console.error('Failed to delete folder:', err)
    }
  },

  toggleExpanded: async (id) => {
    const folder = get().folders.find((f) => f.id === id)
    if (folder) {
      await get().updateFolder(id, { is_expanded: !folder.is_expanded })
    }
  }
}))
