import { create } from 'zustand'
import { AppView } from '../types'

interface UIState {
  currentView: AppView
  theme: 'light' | 'dark'
  commandPaletteOpen: boolean
  sidebarExpanded: boolean
  setView: (view: AppView) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'notes',
  theme: (() => {
    try {
      const saved = localStorage.getItem('opsidian-theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })(),
  commandPaletteOpen: false,
  sidebarExpanded: true,

  setView: (currentView) => set({ currentView }),

  toggleTheme: () => set((state) => {
    const theme = state.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('opsidian-theme', theme)
    } catch {}
    return { theme }
  }),

  setTheme: (theme) => set(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('opsidian-theme', theme)
    } catch {}
    return { theme }
  }),

  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded }))
}))
