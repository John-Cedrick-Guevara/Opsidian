import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function registerLinksIPC(db: Database.Database): void {
  ipcMain.handle('links:create', (_e, source: { type: string; id: string }, target: { type: string; id: string }) => {
    // Avoid duplicates — UNIQUE constraint handles this, but we use INSERT OR IGNORE
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO links (source_type, source_id, target_type, target_id)
      VALUES (@source_type, @source_id, @target_type, @target_id)
      RETURNING *
    `)
    const result = stmt.get({
      source_type: source.type,
      source_id: source.id,
      target_type: target.type,
      target_id: target.id
    })

    // If INSERT OR IGNORE didn't insert (duplicate), return existing
    if (!result) {
      return db.prepare(`
        SELECT * FROM links
        WHERE source_type = @source_type AND source_id = @source_id
          AND target_type = @target_type AND target_id = @target_id
      `).get({
        source_type: source.type,
        source_id: source.id,
        target_type: target.type,
        target_id: target.id
      })
    }

    return result
  })

  ipcMain.handle('links:delete', (_e, id: string) => {
    db.prepare('DELETE FROM links WHERE id = ?').run(id)
  })

  ipcMain.handle('links:getForEntity', (_e, type: string, id: string) => {
    return db.prepare(`
      SELECT l.*,
        CASE
          WHEN l.source_type = @type AND l.source_id = @id THEN l.target_type
          ELSE l.source_type
        END as linked_type,
        CASE
          WHEN l.source_type = @type AND l.source_id = @id THEN l.target_id
          ELSE l.source_id
        END as linked_id
      FROM links l
      WHERE (l.source_type = @type AND l.source_id = @id)
         OR (l.target_type = @type AND l.target_id = @id)
      ORDER BY l.created_at DESC
    `).all({ type, id })
  })

  ipcMain.handle('links:getGraph', () => {
    // Get all notes as nodes
    const notes = db.prepare(`
      SELECT id, title, 'note' as type, updated_at FROM notes
    `).all()

    // Get all tasks as nodes
    const tasks = db.prepare(`
      SELECT id, title, 'task' as type, status, updated_at FROM tasks
    `).all()

    // Get all events as nodes
    const events = db.prepare(`
      SELECT id, title, 'event' as type, updated_at FROM calendar_events
    `).all()

    // Get all edges
    const edges = db.prepare(`
      SELECT id, source_type, source_id, target_type, target_id FROM links
    `).all()

    return {
      nodes: [...notes, ...tasks, ...events],
      edges
    }
  })
}
