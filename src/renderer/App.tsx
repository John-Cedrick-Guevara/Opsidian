import React, { useEffect } from 'react'
import Titlebar from './components/layout/Titlebar'
import Sidebar from './components/layout/Sidebar'
import NoteList from './components/layout/NoteList'
import EditorView from './components/editor/Editor'
import GraphView from './components/graph/GraphView'
import KanbanBoard from './components/kanban/KanbanBoard'
import CalendarView from './components/calendar/CalendarView'
import CommandPalette from './components/layout/CommandPalette'

import { useUIStore } from './stores/useUIStore'
import { useNotesStore } from './stores/useNotesStore'

export const App: React.FC = () => {
  const { currentView, setView, theme, setCommandPaletteOpen, commandPaletteOpen } = useUIStore()
  const { createNote, setCurrentNote } = useNotesStore()

  // Initialize theme class/attribute on html tag
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we are in an input or textarea, don't trigger general shortcuts
      const activeEl = document.activeElement
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      )

      if (isInput) return

      if (e.key === '1') {
        setView('notes')
      } else if (e.key === '2') {
        setView('graph')
      } else if (e.key === '3') {
        setView('kanban')
      } else if (e.key === '4') {
        setView('calendar')
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        createNote('Untitled Note').then((note) => {
          setView('notes')
          setCurrentNote(note)
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [createNote, setCurrentNote, setView])

  const renderContent = () => {
    switch (currentView) {
      case 'notes':
        return (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <NoteList />
            <EditorView />
          </div>
        )
      case 'graph':
        return <GraphView />
      case 'kanban':
        return <KanbanBoard />
      case 'calendar':
        return <CalendarView />
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Titlebar />
      <div className="app-container">
        <Sidebar />
        <main className="app-content">
          {renderContent()}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
export default App
