import { ipcMain } from 'electron'
import Database from 'better-sqlite3'

export function registerFoldersIPC(db: Database.Database): void {
  ipcMain.handle('folders:list', () => {
    return db.prepare(`
      SELECT * FROM folders ORDER BY name ASC
    `).all()
  })

  ipcMain.handle('folders:get', (_e, id: string) => {
    return db.prepare('SELECT * FROM folders WHERE id = ?').get(id)
  })

  ipcMain.handle('folders:create', (_e, data: { name: string; parent_id?: string | null }) => {
    const stmt = db.prepare(`
      INSERT INTO folders (name, parent_id)
      VALUES (@name, @parent_id)
      RETURNING *
    `)
    return stmt.get({
      name: data.name || 'New Folder',
      parent_id: data.parent_id || null
    })
  })

  ipcMain.handle('folders:update', (_e, id: string, data: Partial<{
    name: string
    parent_id: string | null
    is_expanded: boolean
  }>) => {
    const fields: string[] = []
    const values: any = { id }

    if (data.name !== undefined) {
      fields.push('name = @name')
      values.name = data.name
    }
    if (data.parent_id !== undefined) {
      fields.push('parent_id = @parent_id')
      values.parent_id = data.parent_id
    }
    if (data.is_expanded !== undefined) {
      fields.push('is_expanded = @is_expanded')
      values.is_expanded = data.is_expanded ? 1 : 0
    }

    if (fields.length === 0) {
      return db.prepare('SELECT * FROM folders WHERE id = ?').get(id)
    }

    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")

    const stmt = db.prepare(`
      UPDATE folders SET ${fields.join(', ')} WHERE id = @id RETURNING *
    `)
    return stmt.get(values)
  })

  ipcMain.handle('folders:delete', (_e, id: string) => {
    // Notes in deleted folders will have folder_id set to NULL (ON DELETE SET NULL)
    // Subfolders will be deleted (ON DELETE CASCADE)
    db.prepare('DELETE FROM folders WHERE id = ?').run(id)
  })

  ipcMain.handle('folders:getNotes', (_e, folderId: string | null) => {
    if (folderId === null) {
      // Get notes without folder (root level)
      return db.prepare(`
        SELECT * FROM notes WHERE folder_id IS NULL ORDER BY updated_at DESC
      `).all()
    }
    return db.prepare(`
      SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC
    `).all(folderId)
  })
}
