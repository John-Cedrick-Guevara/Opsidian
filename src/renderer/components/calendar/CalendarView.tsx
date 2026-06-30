import React, { useEffect, useState } from 'react'
import { RRule } from 'rrule'
import { CalendarEvent } from '../../types'
import { useEventsStore } from '../../stores/useEventsStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useUIStore } from '../../stores/useUIStore'
import EventModal from './EventModal'
import EventTableView from './EventTableView'
import { Icons } from '../layout/Icons'

// Helper function to expand recurring events within calendar limits
function expandEvents(events: CalendarEvent[], start: Date, end: Date): CalendarEvent[] {
  const expanded: CalendarEvent[] = []

  for (const event of events) {
    if (!event.recurrence_rule) {
      expanded.push(event)
      continue
    }

    try {
      const rule = RRule.fromString(event.recurrence_rule)
      const dates = rule.between(start, end, true) // true = inclusive

      const eventStart = new Date(event.start_at)
      const eventEnd = new Date(event.end_at)
      const duration = eventEnd.getTime() - eventStart.getTime()

      for (const d of dates) {
        // Build start/end timestamps based on the recurring date keeping original hours
        const startAt = new Date(d.getTime())
        startAt.setHours(eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds())
        
        const endAt = new Date(startAt.getTime() + duration)

        expanded.push({
          ...event,
          id: `${event.id}-${startAt.getTime()}`, // unique transient id for occurrence
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString()
        })
      }
    } catch (err) {
      console.error('Failed to parse event RRULE:', event.recurrence_rule, err)
      expanded.push(event)
    }
  }

  return expanded
}

export const CalendarView: React.FC = () => {
  const { events, fetchEvents } = useEventsStore()
  const { notes, setCurrentNote, fetchNotes } = useNotesStore()
  const { fetchTasks } = useTasksStore()
  const { setView } = useUIStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [initialCellDate, setInitialCellDate] = useState<Date | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Start of calendar display range (including previous month tail)
  const firstDayOfMonth = new Date(year, month, 1)
  const startDayOffset = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const calendarStart = new Date(year, month, 1 - startDayOffset)

  // End of calendar range (42 cells later)
  const calendarEnd = new Date(calendarStart.getTime() + 41 * 24 * 60 * 60 * 1000)

  useEffect(() => {
    fetchEvents(calendarStart.toISOString(), calendarEnd.toISOString())
    fetchNotes()
    fetchTasks()
  }, [currentDate])

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleCellClick = (date: Date) => {
    setSelectedEvent(null)
    setInitialCellDate(date)
    setModalOpen(true)
  }

  const handleEventClick = (e: React.MouseEvent, eventItem: CalendarEvent) => {
    e.stopPropagation()
    if (e.altKey && eventItem.linked_note_id) {
      const note = notes.find((n) => n.id === eventItem.linked_note_id)
      if (note) {
        setCurrentNote(note)
        setView('notes')
        return
      }
    }
    setSelectedEvent(eventItem)
    setModalOpen(true)
  }

  const getEventColorClass = (ev: CalendarEvent): string => {
    if (ev.linked_note_id) return 'calendar-event-item--accent'
    if (ev.linked_task_id) return 'calendar-event-item--green'
    if (ev.recurrence_rule) return 'calendar-event-item--blue'
    return 'calendar-event-item--amber'
  }

  const handleImportIcs = async () => {
    const result = await window.opsidian.events.importIcs()
    if (result.imported > 0) {
      fetchEvents(calendarStart.toISOString(), calendarEnd.toISOString())
    }
  }

  // 1. Expand recurring occurrences
  const allOccurrences = expandEvents(events, calendarStart, calendarEnd)

  // 2. Build calendar days
  const cells: { date: Date; out: boolean; today: boolean; dayNum: number; cellEvents: CalendarEvent[] }[] = []
  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const date = new Date(calendarStart.getTime() + i * 24 * 60 * 60 * 1000)
    const isOut = date.getMonth() !== month
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    // Filter events for this specific calendar cell day (local date matching)
    const cellEvents = allOccurrences.filter((ev) => {
      const evDate = new Date(ev.start_at)
      return (
        evDate.getDate() === date.getDate() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getFullYear() === date.getFullYear()
      )
    })

    cells.push({
      date,
      out: isOut,
      today: isToday,
      dayNum: date.getDate(),
      cellEvents
    })
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2>
            {monthName} {year}
          </h2>
          {viewMode === 'calendar' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="calendar-mock__nav-btn" onClick={prevMonth}>
                <Icons.ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <button className="calendar-mock__nav-btn" onClick={nextMonth}>
                <Icons.ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}
          <div className="kanban-view-toggle" style={{ marginLeft: 8 }}>
            <button
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar view"
            >
              <Icons.Calendar style={{ width: 16, height: 16 }} />
              <span>Calendar</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              <span>Table</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={handleImportIcs} title="Import .ics file">
            Import ICS
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedEvent(null)
              setInitialCellDate(new Date())
              setModalOpen(true)
            }}
          >
            <Icons.Plus style={{ width: 16, height: 16 }} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {weekdays.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {cells.map((cell, idx) => (
              <div
                key={idx}
                className={`calendar-day-cell ${cell.out ? 'calendar-day-cell--outside' : ''} ${
                  cell.today ? 'calendar-day-cell--today' : ''
                }`}
                onClick={() => handleCellClick(cell.date)}
              >
                <div className="calendar-day-number">{cell.dayNum}</div>
                <div className="calendar-events-list">
                  {cell.cellEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`calendar-event-item ${getEventColorClass(ev)}`}
                      onClick={(e) => handleEventClick(e, ev)}
                      title={ev.linked_note_id ? `${ev.title} — Alt+click to open linked note` : ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EventTableView
          events={events}
          onEventClick={(event) => {
            setSelectedEvent(event)
            setModalOpen(true)
          }}
          onNewEvent={() => {
            setSelectedEvent(null)
            setInitialCellDate(new Date())
            setModalOpen(true)
          }}
        />
      )}

      {modalOpen && (
        <EventModal
          event={selectedEvent}
          initialDate={initialCellDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
export default CalendarView
