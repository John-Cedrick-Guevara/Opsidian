import React, { useEffect, useState } from 'react'
import { useNotesStore } from '../../stores/useNotesStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useUIStore } from '../../stores/useUIStore'
import { Icons } from '../layout/Icons'

interface BacklinksPanelProps {
  entityId: string
  entityType: 'note' | 'task'
}

interface BacklinkDisplay {
  linkId: string
  id: string
  title: string
  type: 'note' | 'task'
  previewText?: string
}

const COLLAPSED_KEY = 'opsidian-backlinks-collapsed'

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({ entityId, entityType }) => {
  const { notes, setCurrentNote } = useNotesStore()
  const { tasks } = useTasksStore()
  const { setView } = useUIStore()
  const [backlinks, setBacklinks] = useState<BacklinkDisplay[]>([])
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed))
    } catch {}
  }, [collapsed])

  useEffect(() => {
    const loadBacklinks = async () => {
      try {
        const rawLinks = await window.opsidian.links.getForEntity(entityType, entityId)
        const incoming = rawLinks.filter(
          (l) => l.target_type === entityType && l.target_id === entityId
        )

        const resolved: BacklinkDisplay[] = incoming.map((link) => {
          const isNote = link.source_type === 'note'
          let title = 'Untitled'

          if (isNote) {
            const found = notes.find((n) => n.id === link.source_id)
            if (found) title = found.title || 'Untitled Note'
          } else {
            const found = tasks.find((t) => t.id === link.source_id)
            if (found) title = found.title || 'Untitled Task'
          }

          return {
            linkId: link.id,
            id: link.source_id,
            title,
            type: link.source_type as 'note' | 'task',
            previewText: isNote ? 'Referenced this note' : 'Linked task'
          }
        })

        setBacklinks(resolved)
      } catch (err) {
        console.error('Failed to load backlinks:', err)
      }
    }

    loadBacklinks()
  }, [entityId, entityType, notes, tasks])

  const handleBacklinkClick = (backlink: BacklinkDisplay) => {
    if (backlink.type === 'note') {
      const found = notes.find((n) => n.id === backlink.id)
      if (found) {
        setCurrentNote(found)
        setView('notes')
      }
    } else {
      setView('kanban')
    }
  }

  return (
    <div className={`backlinks-panel${collapsed ? ' backlinks-panel--collapsed' : ''}`}>
      <button
        type="button"
        className="backlinks-title backlinks-title--toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand backlinks panel' : 'Collapse backlinks panel'}
      >
        {collapsed ? (
          <Icons.ChevronLeft style={{ width: 12, height: 12 }} />
        ) : (
          <Icons.ChevronDown style={{ width: 12, height: 12 }} />
        )}
        <Icons.Link style={{ width: 12, height: 12 }} />
        <span>Backlinks</span>
        <span className="backlinks-count">{backlinks.length}</span>
      </button>

      {!collapsed && (
        <>
          {backlinks.length === 0 ? (
            <div className="backlinks-empty">No backlinks found</div>
          ) : (
            <div className="backlinks-list">
              {backlinks.map((link) => (
                <div
                  key={link.linkId}
                  className="backlink-item"
                  onClick={() => handleBacklinkClick(link)}
                >
                  <div className="backlink-item-title">{link.title}</div>
                  <div className="backlink-item-preview">{link.previewText}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BacklinksPanel
