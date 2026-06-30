import React, { useState, useEffect } from 'react'
import { Task, Note, KanbanStatus } from '../../types'
import { useTasksStore } from '../../stores/useTasksStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { Icons } from '../layout/Icons'
import { COMMON_RRULES } from '../../../main/recurrence'

interface TaskModalProps {
  task: Task | null
  onClose: () => void
  initialStatus?: KanbanStatus
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, initialStatus }) => {
  const { createTask, updateTask, deleteTask, completeTask } = useTasksStore()
  const { notes } = useNotesStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<KanbanStatus>('todo')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [linkedNoteId, setLinkedNoteId] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setRecurrence(task.recurrence_rule || '')
      setLinkedNoteId(task.linked_note_id || '')
      try {
        setTagsInput(JSON.parse(task.tags || '[]').join(', '))
      } catch {
        setTagsInput('')
      }
    } else {
      setTitle('')
      setDescription('')
      setStatus(initialStatus || 'todo')
      setDueDate('')
      setRecurrence('')
      setLinkedNoteId('')
      setTagsInput('')
    }
  }, [task, initialStatus])

  const handleSave = async () => {
    const tags = JSON.stringify(
      tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    )
    const data = {
      title: title.trim() || 'Untitled Task',
      description,
      status,
      due_date: task ? (dueDate ? new Date(dueDate).toISOString() : null) : new Date().toISOString(),
      recurrence_rule: recurrence || null,
      linked_note_id: linkedNoteId || null,
      tags
    }

    if (task) {
      await updateTask(task.id, data)
    } else {
      await createTask(data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (task && confirm('Delete this task?')) {
      await deleteTask(task.id)
      onClose()
    }
  }

  const handleComplete = async () => {
    if (task) {
      await completeTask(task.id, 'done')
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette" style={{ width: 500, padding: 24, gap: 16 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="theme-toggle-btn" onClick={onClose}>
            <span style={{ fontSize: '1.2rem' }}>&times;</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Title</label>
            <input
              type="text"
              className="notes-search-input"
              style={{ fontSize: '1rem', padding: '8px 12px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task summary..."
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Description</label>
            <textarea
              className="notes-search-input"
              style={{ width: '100%', height: 80, resize: 'none', fontFamily: 'inherit', padding: '8px 12px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Status</label>
              <select
                className="notes-search-input"
                style={{ padding: '8px 12px' }}
                value={status}
                onChange={(e) => setStatus(e.target.value as KanbanStatus)}
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Tags</label>
            <input
              type="text"
              className="notes-search-input"
              style={{ padding: '8px 12px' }}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="eng, p0, docs (comma-separated)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Recurrence Rule */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Recurrence</label>
              <select
                className="notes-search-input"
                style={{ padding: '8px 12px' }}
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option value="">None (One-time)</option>
                <option value={COMMON_RRULES.daily}>Daily</option>
                <option value={COMMON_RRULES.weekdays}>Weekdays</option>
                <option value={COMMON_RRULES.weekly}>Weekly</option>
                <option value={COMMON_RRULES.monthly}>Monthly</option>
              </select>
            </div>

            {/* Linked Note */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Linked Note</label>
              <select
                className="notes-search-input"
                style={{ padding: '8px 12px' }}
                value={linkedNoteId}
                onChange={(e) => setLinkedNoteId(e.target.value)}
              >
                <option value="">None</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title || 'Untitled Note'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            {task && task.status !== 'done' && task.status !== 'skipped' && (
              <button
                className="btn btn-primary"
                style={{ background: 'var(--green)', marginRight: 'auto' }}
                onClick={handleComplete}
              >
                <Icons.Check style={{ width: 14, height: 14 }} />
                <span>Mark Done</span>
              </button>
            )}
            {task && (
              <button className="btn" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }} onClick={handleDelete}>
                <Icons.Trash style={{ width: 14, height: 14 }} />
                <span>Delete</span>
              </button>
            )}
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default TaskModal
