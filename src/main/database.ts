import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const dbPath = join(dbDir, 'opsidian.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)

  return db
}

function runMigrations(db: Database.Database): void {
  // Create version tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `)

  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((r: any) => r.name)
  )

  const migrations: Array<{ name: string; sql: string }> = [
    {
      name: '001_initial_schema',
      sql: `
        CREATE TABLE notes (
          id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          title         TEXT NOT NULL DEFAULT 'Untitled',
          body          TEXT NOT NULL DEFAULT '{}',
          font_size     REAL,
          color         TEXT,
          created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE tasks (
          id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          title           TEXT NOT NULL DEFAULT 'Untitled Task',
          description     TEXT DEFAULT '{}',
          status          TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','doing','done','skipped')),
          kanban_position REAL NOT NULL DEFAULT 0,
          recurrence_rule TEXT,
          due_date        TEXT,
          linked_note_id  TEXT REFERENCES notes(id) ON DELETE SET NULL,
          created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE links (
          id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          source_type TEXT NOT NULL CHECK(source_type IN ('note','task','event')),
          source_id   TEXT NOT NULL,
          target_type TEXT NOT NULL CHECK(target_type IN ('note','task','event')),
          target_id   TEXT NOT NULL,
          created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          UNIQUE(source_type, source_id, target_type, target_id)
        );

        CREATE TABLE calendar_events (
          id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          title           TEXT NOT NULL DEFAULT 'Untitled Event',
          start_at        TEXT NOT NULL,
          end_at          TEXT NOT NULL,
          all_day         INTEGER NOT NULL DEFAULT 0,
          linked_note_id  TEXT REFERENCES notes(id) ON DELETE SET NULL,
          linked_task_id  TEXT REFERENCES tasks(id) ON DELETE SET NULL,
          recurrence_rule TEXT,
          created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE INDEX idx_links_source ON links(source_type, source_id);
        CREATE INDEX idx_links_target ON links(target_type, target_id);
        CREATE INDEX idx_tasks_status ON tasks(status);
        CREATE INDEX idx_tasks_due ON tasks(due_date);
        CREATE INDEX idx_events_range ON calendar_events(start_at, end_at);
      `
    },
    {
      name: '002_add_folders',
      sql: `
        CREATE TABLE folders (
          id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          name        TEXT NOT NULL,
          parent_id   TEXT REFERENCES folders(id) ON DELETE CASCADE,
          is_expanded INTEGER NOT NULL DEFAULT 1,
          created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE INDEX idx_folders_parent ON folders(parent_id);

        ALTER TABLE notes ADD COLUMN folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL;
        CREATE INDEX idx_notes_folder ON notes(folder_id);
      `
    },
    {
      name: '003_add_task_tags',
      sql: `ALTER TABLE tasks ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';`
    }
  ]

  const runMigration = db.transaction((migration: { name: string; sql: string }) => {
    db!.exec(migration.sql)
    db!.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name)
  })

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      runMigration(migration)
      console.log(`[DB] Applied migration: ${migration.name}`)
    }
  }
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}
