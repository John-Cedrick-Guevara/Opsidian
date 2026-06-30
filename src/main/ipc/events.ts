import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function registerEventsIPC(db: Database.Database): void {
  ipcMain.handle('events:list', (_e, start: string, end: string) => {
    return db.prepare(`
      SELECT * FROM calendar_events
      WHERE start_at <= @end AND end_at >= @start
      ORDER BY start_at ASC
    `).all({ start, end })
  })

  ipcMain.handle('events:get', (_e, id: string) => {
    return db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id)
  })

  ipcMain.handle('events:create', (_e, data: {
    title?: string; start_at: string; end_at: string;
    all_day?: boolean; linked_note_id?: string;
    linked_task_id?: string; recurrence_rule?: string
  }) => {
    return db.prepare(`
      INSERT INTO calendar_events (title, start_at, end_at, all_day, linked_note_id, linked_task_id, recurrence_rule)
      VALUES (@title, @start_at, @end_at, @all_day, @linked_note_id, @linked_task_id, @recurrence_rule)
      RETURNING *
    `).get({
      title: data.title || 'Untitled Event',
      start_at: data.start_at,
      end_at: data.end_at,
      all_day: data.all_day ? 1 : 0,
      linked_note_id: data.linked_note_id || null,
      linked_task_id: data.linked_task_id || null,
      recurrence_rule: data.recurrence_rule || null
    })
  })

  ipcMain.handle('events:update', (_e, id: string, data: Partial<{
    title: string; start_at: string; end_at: string;
    all_day: boolean; linked_note_id: string | null;
    linked_task_id: string | null; recurrence_rule: string | null
  }>) => {
    const fields: string[] = []
    const values: any = { id }

    if (data.title !== undefined) { fields.push('title = @title'); values.title = data.title }
    if (data.start_at !== undefined) { fields.push('start_at = @start_at'); values.start_at = data.start_at }
    if (data.end_at !== undefined) { fields.push('end_at = @end_at'); values.end_at = data.end_at }
    if (data.all_day !== undefined) { fields.push('all_day = @all_day'); values.all_day = data.all_day ? 1 : 0 }
    if (data.linked_note_id !== undefined) { fields.push('linked_note_id = @linked_note_id'); values.linked_note_id = data.linked_note_id }
    if (data.linked_task_id !== undefined) { fields.push('linked_task_id = @linked_task_id'); values.linked_task_id = data.linked_task_id }
    if (data.recurrence_rule !== undefined) { fields.push('recurrence_rule = @recurrence_rule'); values.recurrence_rule = data.recurrence_rule }

    if (fields.length === 0) return db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id)

    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")

    return db.prepare(`
      UPDATE calendar_events SET ${fields.join(', ')} WHERE id = @id RETURNING *
    `).get(values)
  })

  ipcMain.handle('events:delete', (_e, id: string) => {
    db.prepare('DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)').run('event', id, 'event', id)
    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id)
  })
}
