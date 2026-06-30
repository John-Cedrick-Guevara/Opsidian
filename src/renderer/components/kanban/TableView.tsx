import React, { useState } from 'react'
import { Task, KanbanStatus, KANBAN_COLUMNS } from '../../types'
import { Icons } from '../layout/Icons'

interface TableViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onNewTask: (status: KanbanStatus) => void
}

type SortKey = 'title' | 'status' | 'due_date' | 'created_at'
type SortOrder = 'asc' | 'desc'

export const TableView: React.FC<TableViewProps> = ({ tasks, onTaskClick, onNewTask }) => {
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status: KanbanStatus) => {
    const col = KANBAN_COLUMNS.find(c => c.key === status)
    return col?.color || 'var(--text-tertiary)'
  }

  const getStatusLabel = (status: KanbanStatus) => {
    const col = KANBAN_COLUMNS.find(c => c.key === status)
    return col?.label || status
  }

  const sortedTasks = getSortedTasks()

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
              onClick={() => handleSort('status')}
            >
              <div className="header-content">
                <span>Status</span>
                {sortKey === 'status' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th 
              className="sortable-header"
              onClick={() => handleSort('due_date')}
            >
              <div className="header-content">
                <span>Due Date</span>
                {sortKey === 'due_date' && (
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
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-table-message">
                <div className="empty-state-content">
                  <Icons.Kanban style={{ width: 32, height: 32, opacity: 0.3 }} />
                  <p>No tasks yet</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onNewTask('todo')}
                  >
                    <Icons.Plus style={{ width: 14, height: 14 }} />
                    Create first task
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr 
                key={task.id} 
                className="task-row"
                onClick={() => onTaskClick(task)}
              >
                <td className="task-title-cell">
                  <div className="task-title-content">
                    {task.status === 'done' && (
                      <Icons.Check style={{ width: 14, height: 14, color: 'var(--green)', flexShrink: 0 }} />
                    )}
                    <span className={task.status === 'done' ? 'task-title-done' : ''}>
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="task-status-cell">
                  <span 
                    className="status-badge"
                    style={{ 
                      background: `color-mix(in srgb, ${getStatusColor(task.status)} 20%, transparent)`,
                      color: getStatusColor(task.status),
                      borderColor: getStatusColor(task.status)
                    }}
                  >
                    <span 
                      className="status-dot"
                      style={{ background: getStatusColor(task.status) }}
                    />
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td className="task-date-cell">
                  {formatDate(task.due_date)}
                </td>
                <td className="task-tags-cell">
                  {task.recurrence_rule && (
                    <span className="tag-label tag-label--recurring">
                      <Icons.Recurring style={{ width: 10, height: 10 }} />
                      <span>Recurring</span>
                    </span>
                  )}
                  {task.linked_note_id && (
                    <span className="tag-label">
                      <Icons.Link style={{ width: 10, height: 10 }} />
                      <span>Linked</span>
                    </span>
                  )}
                </td>
                <td className="task-actions-cell">
                  <button
                    className="btn btn-icon table-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskClick(task)
                    }}
                    title="Edit task"
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

export default TableView
