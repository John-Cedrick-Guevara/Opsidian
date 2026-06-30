import React, { useState } from 'react'
import { CalendarEvent } from '../../types'
import { Icons } from '../layout/Icons'

interface EventTableViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onNewEvent: () => void
}

type SortKey = 'title' | 'start_at' | 'end_at' | 'created_at'
type SortOrder = 'asc' | 'desc'

export const EventTableView: React.FC<EventTableViewProps> = ({ events, onEventClick, onNewEvent }) => {
  const [sortKey, setSortKey] = useState<SortKey>('start_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const getSortedEvents = () => {
    return [...events].sort((a, b) => {
      let aVal: any = a[sortKey]
      let bVal: any = b[sortKey]

      // Handle null values
      if (aVal === null) return 1
      if (bVal === null) return -1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      // Default comparison
      return sortOrder === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1)
    })
  }

  const formatDateTime = (dateStr: string, allDay: boolean) => {
    try {
      const d = new Date(dateStr)
      if (allDay) {
        return d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const sortedEvents = getSortedEvents()

  return (
    <div className="table-view-container">
      <table className="tasks-table">
        <thead>
          <tr>
            <th 
              className="sortable-header"
              onClick={() => handleSort('title')}
            >
              <div className="header-content">
                <span>Title</span>
                {sortKey === 'title' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th 
              className="sortable-header"
              onClick={() => handleSort('start_at')}
            >
              <div className="header-content">
                <span>Start</span>
                {sortKey === 'start_at' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th 
              className="sortable-header"
              onClick={() => handleSort('end_at')}
            >
              <div className="header-content">
                <span>End</span>
                {sortKey === 'end_at' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-table-message">
                <div className="empty-state-content">
                  <Icons.Calendar style={{ width: 32, height: 32, opacity: 0.3 }} />
                  <p>No events yet</p>
                  <button 
                    className="btn btn-primary"
                    onClick={onNewEvent}
                  >
                    <Icons.Plus style={{ width: 14, height: 14 }} />
                    Create first event
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            sortedEvents.map((event) => (
              <tr 
                key={event.id} 
                className="task-row"
                onClick={() => onEventClick(event)}
              >
                <td className="task-title-cell">
                  <div className="task-title-content">
                    <Icons.Calendar style={{ width: 14, height: 14, color: 'var(--accent)', flexShrink: 0, marginRight: 8 }} />
                    <span>{event.title}</span>
                  </div>
                </td>
                <td className="task-date-cell">
                  {formatDateTime(event.start_at, event.all_day)}
                </td>
                <td className="task-date-cell">
                  {formatDateTime(event.end_at, event.all_day)}
                </td>
                <td className="task-tags-cell">
                  {event.all_day && (
                    <span className="tag-label">All Day</span>
                  )}
                  {event.recurrence_rule && (
                    <span className="tag-label tag-label--recurring">
                      <Icons.Recurring style={{ width: 10, height: 10 }} />
                      <span>Recurring</span>
                    </span>
                  )}
                  {event.linked_note_id && (
                    <span className="tag-label">
                      <Icons.Link style={{ width: 10, height: 10 }} />
                      <span>Note</span>
                    </span>
                  )}
                  {event.linked_task_id && (
                    <span className="tag-label">
                      <Icons.Link style={{ width: 10, height: 10 }} />
                      <span>Task</span>
                    </span>
                  )}
                </td>
                <td className="task-actions-cell">
                  <button
                    className="btn btn-icon table-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    title="Edit event"
                  >
                    <Icons.Edit style={{ width: 14, height: 14 }} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default EventTableView
