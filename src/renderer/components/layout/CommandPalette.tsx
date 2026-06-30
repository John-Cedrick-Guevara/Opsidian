import React, { useState, useEffect, useRef } from 'react'
import { useUIStore } from '../../stores/useUIStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useEventsStore } from '../../stores/useEventsStore'
import { AppView } from '../../types'

interface CommandItem {
  id: string
  label: string
  shortcut?: string
  action: () => void
  category: 'Navigation' | 'Actions' | 'Notes'
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setView } = useUIStore()
  const { createNote, notes, setCurrentNote } = useNotesStore()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault()
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen])

  if (!commandPaletteOpen) return null

  const navigationCommands: CommandItem[] = [
    { id: 'nav-notes', label: 'Go to Notes', shortcut: '1', category: 'Navigation', action: () => setView('notes') },
    { id: 'nav-graph', label: 'Go to Graph View', shortcut: '2', category: 'Navigation', action: () => setView('graph') },
    { id: 'nav-kanban', label: 'Go to Kanban Board', shortcut: '3', category: 'Navigation', action: () => setView('kanban') },
    { id: 'nav-calendar', label: 'Go to Calendar', shortcut: '4', category: 'Navigation', action: () => setView('calendar') }
  ]

  const actionCommands: CommandItem[] = [
    {
      id: 'act-new-note',
      label: 'Create New Note',
      shortcut: 'C',
      category: 'Actions',
      action: async () => {
        const note = await createNote('Untitled Note')
        setView('notes')
        setCurrentNote(note)
      }
    }
  ]

  // Add notes to commands list if user is searching
  const noteCommands: CommandItem[] = notes.map((n) => ({
    id: `note-${n.id}`,
    label: `Open: ${n.title || 'Untitled Note'}`,
    category: 'Notes',
    action: () => {
      setCurrentNote(n)
      setView('notes')
    }
  }))

  const allCommands = [...navigationCommands, ...actionCommands, ...noteCommands]

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
        setCommandPaletteOpen(false)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="command-palette-search"
          placeholder="Type a command or search notes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="command-palette-results">
          {filteredCommands.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text-tertiary)', textAlign: 'center' }}>
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-item ${idx === selectedIndex ? 'command-item--selected' : ''}`}
                onClick={() => {
                  cmd.action()
                  setCommandPaletteOpen(false)
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {cmd.category}
                  </span>
                  <span className="command-item-label">{cmd.label}</span>
                </div>
                {cmd.shortcut && (
                  <span className="command-item-shortcut">{cmd.shortcut}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default CommandPalette
