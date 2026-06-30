import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../../types'
import { Icons } from '../layout/Icons'
import { useTasksStore } from '../../stores/useTasksStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { useUIStore } from '../../stores/useUIStore'

interface KanbanCardProps {
  task: Task
  onClick: () => void
}

function parseTags(tagsJson: string | undefined): string[] {
  try {
    const parsed = JSON.parse(tagsJson || '[]')
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

const TAG_COLORS: Record<string, string> = {
  eng: 'blue',
  ui: 'green',
  p0: 'amber',
  docs: '',
  deferred: ''
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
  const { deleteTask } = useTasksStore()
  const { notes, setCurrentNote } = useNotesStore()
  const { setView } = useUIStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const tags = parseTags(task.tags)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const openLinkedNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.linked_note_id) return
    const note = notes.find((n) => n.id === task.linked_note_id)
    if (note) {
      setCurrentNote(note)
      setView('notes')
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card${task.status === 'done' ? ' kanban-card--done' : ''}${task.status === 'skipped' ? ' kanban-card--skipped' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div className="kanban-card-title" style={{ flex: 1, cursor: 'pointer' }} onClick={() => !isDragging && onClick()}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {task.linked_note_id && (
            <button className="theme-toggle-btn" style={{ padding: 2 }} onClick={openLinkedNote} title="Open linked note">
              <Icons.Note style={{ width: 12, height: 12 }} />
            </button>
          )}
          <button className="theme-toggle-btn" style={{ padding: 2, color: 'var(--rose)' }} onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteTask(task.id) }} title="Delete">
            <Icons.Trash style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>

      <div className="kanban-card-meta">
        {task.recurrence_rule && (
          <span className="tag-label tag-label--recurring">
            <Icons.Recurring style={{ width: 10, height: 10 }} />
            <span>Recurring</span>
          </span>
        )}
        {tags.map((tag) => (
          <span key={tag} className={`tag-label${TAG_COLORS[tag] ? ` tag-label--${TAG_COLORS[tag]}` : ''}`}>
            {tag}
          </span>
        ))}
        {task.due_date && <span className="tag-label">{formatDate(task.due_date)}</span>}
      </div>
    </div>
  )
}

export default KanbanCard
