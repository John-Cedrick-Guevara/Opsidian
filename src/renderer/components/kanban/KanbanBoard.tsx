import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import { useTasksStore } from '../../stores/useTasksStore'
import { Task, KanbanStatus, KANBAN_COLUMNS } from '../../types'
import KanbanCard from './KanbanCard'
import TaskModal from './TaskModal'
import TableView from './TableView'
import { Icons } from '../layout/Icons'

// Droppable Column Component
const DroppableColumn: React.FC<{
  id: string
  children: React.ReactNode
}> = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="kanban-cards-list">
      {children}
    </div>
  )
}

export const KanbanBoard: React.FC = () => {
  const { tasks, fetchTasks, reorderTask, completeTask } = useTasksStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [initialStatus, setInitialStatus] = useState<KanbanStatus>('todo')
  const [overId, setOverId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board')
  const [boardFilter, setBoardFilter] = useState<'all' | 'recurring' | 'linked'>('all')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? String(over.id) : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setOverId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const draggedTask = tasks.find((t) => t.id === activeId)
    if (!draggedTask) return

    // Determine target column and target position
    let targetStatus: KanbanStatus = draggedTask.status
    let targetIndex = -1
    let columnTasks: Task[] = []

    // Check if over is a column droppable zone (like 'droppable-todo')
    if (overId.startsWith('droppable-')) {
      targetStatus = overId.replace('droppable-', '') as KanbanStatus
      columnTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.kanban_position - b.kanban_position)
      targetIndex = -1 // Append to end
    } else {
      // Over is a task card
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) {
        targetStatus = overTask.status
        columnTasks = tasks
          .filter((t) => t.status === targetStatus && t.id !== activeId)
          .sort((a, b) => a.kanban_position - b.kanban_position)
        targetIndex = columnTasks.findIndex((t) => t.id === overId)
      } else {
        return
      }
    }

    // Check if anything actually changed
    if (draggedTask.status === targetStatus && targetIndex === -1) {
      const currentIndex = columnTasks.findIndex((t) => t.id === activeId)
      if (currentIndex === columnTasks.length - 1 || columnTasks.length === 0) {
        return // Already at the end of the same column
      }
    }

    // Calculate new fractional index position
    let newPosition = 0
    if (columnTasks.length === 0) {
      newPosition = 1.0
    } else if (targetIndex === 0) {
      // Drop at top
      newPosition = columnTasks[0].kanban_position / 2
    } else if (targetIndex === -1 || targetIndex >= columnTasks.length) {
      // Drop at bottom
      newPosition = columnTasks[columnTasks.length - 1].kanban_position + 1.0
    } else {
      // Drop in middle
      const prevTask = columnTasks[targetIndex - 1]
      const nextTask = columnTasks[targetIndex]
      newPosition = (prevTask.kanban_position + nextTask.kanban_position) / 2
    }

    reorderTask(activeId, newPosition, targetStatus)

    if (
      (targetStatus === 'done' || targetStatus === 'skipped') &&
      draggedTask.recurrence_rule &&
      draggedTask.status !== targetStatus
    ) {
      completeTask(activeId, targetStatus)
    }
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  const openNewModal = (status: KanbanStatus) => {
    setSelectedTask(null)
    setInitialStatus(status)
    setModalOpen(true)
  }

  const filteredTasks = tasks.filter((t) => {
    if (boardFilter === 'recurring') return !!t.recurrence_rule
    if (boardFilter === 'linked') return !!t.linked_note_id
    return true
  })

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <h2>Board · Engineering</h2>
          <select
            className="kanban-filter-select"
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value as typeof boardFilter)}
            aria-label="Filter board"
          >
            <option value="all">filter: all</option>
            <option value="recurring">filter: recurring</option>
            <option value="linked">filter: linked notes</option>
          </select>
          <div className="kanban-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'board' ? 'view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Board view"
            >
              <Icons.Kanban style={{ width: 16, height: 16 }} />
              <span>Board</span>
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
        <button className="btn btn-primary" onClick={() => openNewModal('todo')}>
          <Icons.Plus style={{ width: 16, height: 16 }} />
          <span>New Task</span>
        </button>
      </div>

      {viewMode === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-columns">
            {KANBAN_COLUMNS.map((col) => {
              const colTasks = filteredTasks
                .filter((t) => t.status === col.key)
                .sort((a, b) => a.kanban_position - b.kanban_position)

              const isOver = overId === `droppable-${col.key}` || 
                            colTasks.some(t => t.id === overId)

              return (
                <div key={col.key} className="kanban-column">
                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <span
                        className="kanban-column-dot"
                        style={{ background: col.color }}
                      />
                      <span>{col.label}</span>
                      <span className="kanban-column-count">{colTasks.length}</span>
                    </div>
                    <button
                      className="theme-toggle-btn"
                      style={{ padding: 2 }}
                      onClick={() => openNewModal(col.key)}
                      title={`Add task to ${col.label}`}
                    >
                      <Icons.Plus style={{ width: 14, height: 14 }} />
                    </button>
                  </div>

                  <SortableContext
                    items={colTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableColumn id={`droppable-${col.key}`}>
                      {colTasks.length === 0 && (
                        <div
                          className="kanban-empty-state"
                          style={{
                            border: isOver ? '2px dashed var(--accent)' : '2px dashed transparent',
                            background: isOver ? 'var(--accent-subtle)' : 'transparent'
                          }}
                        >
                          {isOver ? 'Drop here' : 'No tasks'}
                        </div>
                      )}
                      {colTasks.map((task) => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          onClick={() => openEditModal(task)}
                        />
                      ))}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div 
                className="kanban-card kanban-card--dragging"
              >
                <div className="kanban-card-title">{activeTask.title}</div>
                {activeTask.recurrence_rule && (
                  <div className="kanban-card-meta">
                    <span className="tag-label tag-label--recurring">
                      <Icons.Recurring style={{ width: 10, height: 10 }} />
                      <span>Recurring</span>
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <TableView 
          tasks={filteredTasks} 
          onTaskClick={openEditModal} 
          onNewTask={openNewModal}
        />
      )}

      {modalOpen && (
        <TaskModal
          task={selectedTask}
          initialStatus={initialStatus}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
export default KanbanBoard
