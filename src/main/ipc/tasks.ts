import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { generateNextOccurrence } from '../recurrence'

export function registerTasksIPC(db: Database.Database): void {
  ipcMain.handle('tasks:list', (_e, filter?: { status?: string }) => {
    if (filter?.status) {
      return db.prepare(`
        SELECT * FROM tasks WHERE status = ? ORDER BY kanban_position ASC
      `).all(filter.status)
    }
    return db.prepare('SELECT * FROM tasks ORDER BY kanban_position ASC').all()
  })

  ipcMain.handle('tasks:get', (_e, id: string) => {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  })

  ipcMain.handle('tasks:create', (_e, data: {
    title?: string; description?: string; status?: string;
    kanban_position?: number; recurrence_rule?: string;
    due_date?: string; linked_note_id?: string; tags?: string
  }) => {
    // If no position specified, place at end of the target column
    let position = data.kanban_position
    if (position === undefined) {
      const status = data.status || 'todo'
      const last = db.prepare(
        'SELECT MAX(kanban_position) as max_pos FROM tasks WHERE status = ?'
      ).get(status) as any
      position = (last?.max_pos ?? 0) + 1
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, kanban_position, recurrence_rule, due_date, linked_note_id, tags)
      VALUES (@title, @description, @status, @kanban_position, @recurrence_rule, @due_date, @linked_note_id, @tags)
      RETURNING *
    `)
    return stmt.get({
      title: data.title || 'Untitled Task',
      description: data.description || '{}',
      status: data.status || 'todo',
      kanban_position: position,
      recurrence_rule: data.recurrence_rule || null,
      due_date: data.due_date || null,
      linked_note_id: data.linked_note_id || null,
      tags: data.tags || '[]'
    })
  })

  ipcMain.handle('tasks:update', (_e, id: string, data: Partial<{
    title: string; description: string; status: string;
    kanban_position: number; recurrence_rule: string | null;
    due_date: string | null; linked_note_id: string | null; tags: string
  }>) => {
    const fields: string[] = []
    const values: any = { id }

    if (data.title !== undefined) { fields.push('title = @title'); values.title = data.title }
    if (data.description !== undefined) { fields.push('description = @description'); values.description = data.description }
    if (data.status !== undefined) { fields.push('status = @status'); values.status = data.status }
    if (data.kanban_position !== undefined) { fields.push('kanban_position = @kanban_position'); values.kanban_position = data.kanban_position }
    if (data.recurrence_rule !== undefined) { fields.push('recurrence_rule = @recurrence_rule'); values.recurrence_rule = data.recurrence_rule }
    if (data.due_date !== undefined) { fields.push('due_date = @due_date'); values.due_date = data.due_date }
    if (data.linked_note_id !== undefined) { fields.push('linked_note_id = @linked_note_id'); values.linked_note_id = data.linked_note_id }
    if (data.tags !== undefined) { fields.push('tags = @tags'); values.tags = data.tags }

    if (fields.length === 0) return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)

    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")

    return db.prepare(`
      UPDATE tasks SET ${fields.join(', ')} WHERE id = @id RETURNING *
    `).get(values)
  })

  ipcMain.handle('tasks:delete', (_e, id: string) => {
    db.prepare('DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)').run('task', id, 'task', id)
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  })

  ipcMain.handle('tasks:reorder', (_e, id: string, newPosition: number, newStatus?: string) => {
    const fields = ['kanban_position = @kanban_position']
    const values: any = { id, kanban_position: newPosition }

    if (newStatus) {
      fields.push('status = @status')
      values.status = newStatus
    }

    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")

    return db.prepare(`
      UPDATE tasks SET ${fields.join(', ')} WHERE id = @id RETURNING *
    `).get(values)
  })

  // Complete a task — handles recurrence logic
  ipcMain.handle('tasks:complete', (_e, id: string, targetStatus: 'done' | 'skipped' = 'done') => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any
    if (!task) throw new Error(`Task ${id} not found`)

    const completeAndGenerate = db.transaction(() => {
      // Mark current task as done/skipped
      db.prepare(`
        UPDATE tasks SET status = @status, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = @id
      `).run({ id, status: targetStatus })

      const completed = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)

      // If recurring, generate next occurrence
      let next = null
      if (task.recurrence_rule) {
        const nextDueDate = generateNextOccurrence(
          task.recurrence_rule,
          task.due_date || new Date().toISOString()
        )

        if (nextDueDate) {
          // Get max position in 'todo' column
          const last = db.prepare(
            'SELECT MAX(kanban_position) as max_pos FROM tasks WHERE status = ?'
          ).get('todo') as any
          const nextPos = (last?.max_pos ?? 0) + 1

          next = db.prepare(`
            INSERT INTO tasks (title, description, status, kanban_position, recurrence_rule, due_date, linked_note_id)
            VALUES (@title, @description, 'todo', @kanban_position, @recurrence_rule, @due_date, @linked_note_id)
            RETURNING *
          `).get({
            title: task.title,
            description: task.description,
            kanban_position: nextPos,
            recurrence_rule: task.recurrence_rule,
            due_date: nextDueDate,
            linked_note_id: task.linked_note_id
          })
        }
      }

      return { completed, next }
    })

    return completeAndGenerate()
  })
}
