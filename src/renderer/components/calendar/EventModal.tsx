import React, { useState, useEffect } from 'react'
import { CalendarEvent, Note, Task } from '../../types'
import { useEventsStore } from '../../stores/useEventsStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useLinksStore } from '../../stores/useLinksStore'
import { Icons } from '../layout/Icons'
import { COMMON_RRULES } from '../../../main/recurrence'

interface EventModalProps {
  event: CalendarEvent | null
  onClose: () => void
  initialDate?: Date
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose, initialDate }) => {
  const { createEvent, updateEvent, deleteEvent } = useEventsStore()
  const { notes } = useNotesStore()
  const { tasks } = useTasksStore()
  const { createLink } = useLinksStore()

  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [recurrence, setRecurrence] = useState('')
  const [linkedNoteId, setLinkedNoteId] = useState('')
  const [linkedTaskId, setLinkedTaskId] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStartAt(event.start_at.substring(0, 16)) // Format for datetime-local
      setEndAt(event.end_at.substring(0, 16))
      setAllDay(event.all_day)
      setRecurrence(event.recurrence_rule || '')
      setLinkedNoteId(event.linked_note_id || '')
      setLinkedTaskId(event.linked_task_id || '')
    } else {
      const defaultStart = initialDate || new Date()
      // Round to top of next hour
      defaultStart.setMinutes(0, 0, 0)
      const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)

      setTitle('')
      setStartAt(new Date(defaultStart.getTime() - defaultStart.getTimezoneOffset() * 60000).toISOString().substring(0, 16))
      setEndAt(new Date(defaultEnd.getTime() - defaultEnd.getTimezoneOffset() * 60000).toISOString().substring(0, 16))
      setAllDay(false)
      setRecurrence('')
      setLinkedNoteId('')
      setLinkedTaskId('')
    }
  }, [event, initialDate])

  const handleSave = async () => {
    const data = {
      title: title.trim() || 'Untitled Event',
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      all_day: allDay,
      recurrence_rule: recurrence || null,
      linked_note_id: linkedNoteId || null,
      linked_task_id: linkedTaskId || null
    }

    let savedEvent: CalendarEvent
    if (event) {
      // If the event is an occurrence copy (id containing hyphenated timestamp), update the master event instead
      const masterId = event.id.includes('-') ? event.id.split('-')[0] : event.id
      await updateEvent(masterId, data)
      savedEvent = { ...event, ...data, id: masterId }
    } else {
      savedEvent = await createEvent(data)
    }

    // Create bidirectional link if entity linkages selected
    if (linkedNoteId) {
      await createLink({ type: 'event', id: savedEvent.id }, { type: 'note', id: linkedNoteId })
    }
    if (linkedTaskId) {
      await createLink({ type: 'event', id: savedEvent.id }, { type: 'task', id: linkedTaskId })
    }

    onClose()
  }

  const handleDelete = async () => {
    if (event && confirm('Delete this event?')) {
      const masterId = event.id.includes('-') ? event.id.split('-')[0] : event.id
      await deleteEvent(masterId)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette" style={{ width: 480, padding: 24, gap: 16 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>{event ? 'Edit Event' : 'New Event'}</h3>
          <button className="theme-toggle-btn" onClick={onClose}>
            <span style={{ fontSize: '1.2rem' }}>&times;</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Event Title</label>
            <input
              type="text"
              className="notes-search-input"
              style={{ fontSize: '1rem', padding: '8px 12px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Start time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Starts At</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                className="notes-search-input"
                style={{ padding: '7px 12px' }}
                value={allDay ? startAt.substring(0, 10) : startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>

            {/* End time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Ends At</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                className="notes-search-input"
                style={{ padding: '7px 12px' }}
                value={allDay ? endAt.substring(0, 10) : endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="allDayCheckbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <label htmlFor="allDayCheckbox" style={{ fontSize: '0.85rem', userSelect: 'none' }}>All Day Event</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Recurrence Selection */}
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

          {/* Linked Task */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 6 }}>Linked Task</label>
            <select
              className="notes-search-input"
              style={{ padding: '8px 12px' }}
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
            >
              <option value="">None</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title || 'Untitled Task'}
                </option>
              ))}
            </select>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            {event && (
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
export default EventModal
