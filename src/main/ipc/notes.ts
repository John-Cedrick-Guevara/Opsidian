import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function registerNotesIPC(db: Database.Database): void {
  ipcMain.handle('notes:list', () => {
    return db.prepare(`
      SELECT * FROM notes ORDER BY updated_at DESC
    `).all()
  })

  ipcMain.handle('notes:get', (_e, id: string) => {
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  })

  ipcMain.handle('notes:create', (_e, data: { title?: string; body?: string; folder_id?: string | null }) => {
    const stmt = db.prepare(`
      INSERT INTO notes (title, body, folder_id)
      VALUES (@title, @body, @folder_id)
      RETURNING *
    `)
    return stmt.get({
      title: data.title || 'Untitled',
      body: data.body || '{}',
      folder_id: data.folder_id || null
    })
  })

  ipcMain.handle('notes:update', (_e, id: string, data: Partial<{
    title: string; body: string; font_size: number | null; color: string | null; folder_id: string | null
  }>) => {
    const fields: string[] = []
    const values: any = { id }

    if (data.title !== undefined) { fields.push('title = @title'); values.title = data.title }
    if (data.body !== undefined) { fields.push('body = @body'); values.body = data.body }
    if (data.font_size !== undefined) { fields.push('font_size = @font_size'); values.font_size = data.font_size }
    if (data.color !== undefined) { fields.push('color = @color'); values.color = data.color }
    if (data.folder_id !== undefined) { fields.push('folder_id = @folder_id'); values.folder_id = data.folder_id }

    if (fields.length === 0) return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)

    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")

    const stmt = db.prepare(`
      UPDATE notes SET ${fields.join(', ')} WHERE id = @id RETURNING *
    `)
    return stmt.get(values)
  })

  ipcMain.handle('notes:delete', (_e, id: string) => {
    db.prepare('DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)').run('note', id, 'note', id)
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  })

  ipcMain.handle('notes:search', (_e, query: string) => {
    return db.prepare(`
      SELECT * FROM notes
      WHERE title LIKE @q OR body LIKE @q
      ORDER BY updated_at DESC
      LIMIT 50
    `).all({ q: `%${query}%` })
  })
}
