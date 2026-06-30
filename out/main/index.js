"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const rrule = require("rrule");
let db = null;
function initDatabase() {
  const userDataPath = electron.app.getPath("userData");
  const dbDir = path.join(userDataPath, "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "opsidian.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
function runMigrations(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  const applied = new Set(
    db2.prepare("SELECT name FROM _migrations").all().map((r) => r.name)
  );
  const migrations = [
    {
      name: "001_initial_schema",
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
      name: "002_add_folders",
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
      name: "003_add_task_tags",
      sql: `ALTER TABLE tasks ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';`
    }
  ];
  const runMigration = db2.transaction((migration) => {
    db2.exec(migration.sql);
    db2.prepare("INSERT INTO _migrations (name) VALUES (?)").run(migration.name);
  });
  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      runMigration(migration);
      console.log(`[DB] Applied migration: ${migration.name}`);
    }
  }
}
function registerNotesIPC(db2) {
  electron.ipcMain.handle("notes:list", () => {
    return db2.prepare(`
      SELECT * FROM notes ORDER BY updated_at DESC
    `).all();
  });
  electron.ipcMain.handle("notes:get", (_e, id) => {
    return db2.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  });
  electron.ipcMain.handle("notes:create", (_e, data) => {
    const stmt = db2.prepare(`
      INSERT INTO notes (title, body, folder_id)
      VALUES (@title, @body, @folder_id)
      RETURNING *
    `);
    return stmt.get({
      title: data.title || "Untitled",
      body: data.body || "{}",
      folder_id: data.folder_id || null
    });
  });
  electron.ipcMain.handle("notes:update", (_e, id, data) => {
    const fields = [];
    const values = { id };
    if (data.title !== void 0) {
      fields.push("title = @title");
      values.title = data.title;
    }
    if (data.body !== void 0) {
      fields.push("body = @body");
      values.body = data.body;
    }
    if (data.font_size !== void 0) {
      fields.push("font_size = @font_size");
      values.font_size = data.font_size;
    }
    if (data.color !== void 0) {
      fields.push("color = @color");
      values.color = data.color;
    }
    if (data.folder_id !== void 0) {
      fields.push("folder_id = @folder_id");
      values.folder_id = data.folder_id;
    }
    if (fields.length === 0) return db2.prepare("SELECT * FROM notes WHERE id = ?").get(id);
    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    const stmt = db2.prepare(`
      UPDATE notes SET ${fields.join(", ")} WHERE id = @id RETURNING *
    `);
    return stmt.get(values);
  });
  electron.ipcMain.handle("notes:delete", (_e, id) => {
    db2.prepare("DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)").run("note", id, "note", id);
    db2.prepare("DELETE FROM notes WHERE id = ?").run(id);
  });
  electron.ipcMain.handle("notes:search", (_e, query) => {
    return db2.prepare(`
      SELECT * FROM notes
      WHERE title LIKE @q OR body LIKE @q
      ORDER BY updated_at DESC
      LIMIT 50
    `).all({ q: `%${query}%` });
  });
}
function generateNextOccurrence(rruleString, afterDate) {
  try {
    const rule = rrule.RRule.fromString(rruleString);
    const after = new Date(afterDate);
    const next = rule.after(after, false);
    if (!next) return null;
    return next.toISOString();
  } catch (err) {
    console.error("[Recurrence] Failed to parse RRULE:", rruleString, err);
    return null;
  }
}
function registerTasksIPC(db2) {
  electron.ipcMain.handle("tasks:list", (_e, filter) => {
    if (filter?.status) {
      return db2.prepare(`
        SELECT * FROM tasks WHERE status = ? ORDER BY kanban_position ASC
      `).all(filter.status);
    }
    return db2.prepare("SELECT * FROM tasks ORDER BY kanban_position ASC").all();
  });
  electron.ipcMain.handle("tasks:get", (_e, id) => {
    return db2.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  });
  electron.ipcMain.handle("tasks:create", (_e, data) => {
    let position = data.kanban_position;
    if (position === void 0) {
      const status = data.status || "todo";
      const last = db2.prepare(
        "SELECT MAX(kanban_position) as max_pos FROM tasks WHERE status = ?"
      ).get(status);
      position = (last?.max_pos ?? 0) + 1;
    }
    const stmt = db2.prepare(`
      INSERT INTO tasks (title, description, status, kanban_position, recurrence_rule, due_date, linked_note_id, tags)
      VALUES (@title, @description, @status, @kanban_position, @recurrence_rule, @due_date, @linked_note_id, @tags)
      RETURNING *
    `);
    return stmt.get({
      title: data.title || "Untitled Task",
      description: data.description || "{}",
      status: data.status || "todo",
      kanban_position: position,
      recurrence_rule: data.recurrence_rule || null,
      due_date: data.due_date || null,
      linked_note_id: data.linked_note_id || null,
      tags: data.tags || "[]"
    });
  });
  electron.ipcMain.handle("tasks:update", (_e, id, data) => {
    const fields = [];
    const values = { id };
    if (data.title !== void 0) {
      fields.push("title = @title");
      values.title = data.title;
    }
    if (data.description !== void 0) {
      fields.push("description = @description");
      values.description = data.description;
    }
    if (data.status !== void 0) {
      fields.push("status = @status");
      values.status = data.status;
    }
    if (data.kanban_position !== void 0) {
      fields.push("kanban_position = @kanban_position");
      values.kanban_position = data.kanban_position;
    }
    if (data.recurrence_rule !== void 0) {
      fields.push("recurrence_rule = @recurrence_rule");
      values.recurrence_rule = data.recurrence_rule;
    }
    if (data.due_date !== void 0) {
      fields.push("due_date = @due_date");
      values.due_date = data.due_date;
    }
    if (data.linked_note_id !== void 0) {
      fields.push("linked_note_id = @linked_note_id");
      values.linked_note_id = data.linked_note_id;
    }
    if (data.tags !== void 0) {
      fields.push("tags = @tags");
      values.tags = data.tags;
    }
    if (fields.length === 0) return db2.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    return db2.prepare(`
      UPDATE tasks SET ${fields.join(", ")} WHERE id = @id RETURNING *
    `).get(values);
  });
  electron.ipcMain.handle("tasks:delete", (_e, id) => {
    db2.prepare("DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)").run("task", id, "task", id);
    db2.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  });
  electron.ipcMain.handle("tasks:reorder", (_e, id, newPosition, newStatus) => {
    const fields = ["kanban_position = @kanban_position"];
    const values = { id, kanban_position: newPosition };
    if (newStatus) {
      fields.push("status = @status");
      values.status = newStatus;
    }
    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    return db2.prepare(`
      UPDATE tasks SET ${fields.join(", ")} WHERE id = @id RETURNING *
    `).get(values);
  });
  electron.ipcMain.handle("tasks:complete", (_e, id, targetStatus = "done") => {
    const task = db2.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!task) throw new Error(`Task ${id} not found`);
    const completeAndGenerate = db2.transaction(() => {
      db2.prepare(`
        UPDATE tasks SET status = @status, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = @id
      `).run({ id, status: targetStatus });
      const completed = db2.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      let next = null;
      if (task.recurrence_rule) {
        const nextDueDate = generateNextOccurrence(
          task.recurrence_rule,
          task.due_date || (/* @__PURE__ */ new Date()).toISOString()
        );
        if (nextDueDate) {
          const last = db2.prepare(
            "SELECT MAX(kanban_position) as max_pos FROM tasks WHERE status = ?"
          ).get("todo");
          const nextPos = (last?.max_pos ?? 0) + 1;
          next = db2.prepare(`
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
          });
        }
      }
      return { completed, next };
    });
    return completeAndGenerate();
  });
}
function registerLinksIPC(db2) {
  electron.ipcMain.handle("links:create", (_e, source, target) => {
    const stmt = db2.prepare(`
      INSERT OR IGNORE INTO links (source_type, source_id, target_type, target_id)
      VALUES (@source_type, @source_id, @target_type, @target_id)
      RETURNING *
    `);
    const result = stmt.get({
      source_type: source.type,
      source_id: source.id,
      target_type: target.type,
      target_id: target.id
    });
    if (!result) {
      return db2.prepare(`
        SELECT * FROM links
        WHERE source_type = @source_type AND source_id = @source_id
          AND target_type = @target_type AND target_id = @target_id
      `).get({
        source_type: source.type,
        source_id: source.id,
        target_type: target.type,
        target_id: target.id
      });
    }
    return result;
  });
  electron.ipcMain.handle("links:delete", (_e, id) => {
    db2.prepare("DELETE FROM links WHERE id = ?").run(id);
  });
  electron.ipcMain.handle("links:getForEntity", (_e, type, id) => {
    return db2.prepare(`
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
    `).all({ type, id });
  });
  electron.ipcMain.handle("links:getGraph", () => {
    const notes = db2.prepare(`
      SELECT id, title, 'note' as type, updated_at FROM notes
    `).all();
    const tasks = db2.prepare(`
      SELECT id, title, 'task' as type, status, updated_at FROM tasks
    `).all();
    const events = db2.prepare(`
      SELECT id, title, 'event' as type, updated_at FROM calendar_events
    `).all();
    const edges = db2.prepare(`
      SELECT id, source_type, source_id, target_type, target_id FROM links
    `).all();
    return {
      nodes: [...notes, ...tasks, ...events],
      edges
    };
  });
}
function registerEventsIPC(db2) {
  electron.ipcMain.handle("events:list", (_e, start, end) => {
    return db2.prepare(`
      SELECT * FROM calendar_events
      WHERE start_at <= @end AND end_at >= @start
      ORDER BY start_at ASC
    `).all({ start, end });
  });
  electron.ipcMain.handle("events:get", (_e, id) => {
    return db2.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id);
  });
  electron.ipcMain.handle("events:create", (_e, data) => {
    return db2.prepare(`
      INSERT INTO calendar_events (title, start_at, end_at, all_day, linked_note_id, linked_task_id, recurrence_rule)
      VALUES (@title, @start_at, @end_at, @all_day, @linked_note_id, @linked_task_id, @recurrence_rule)
      RETURNING *
    `).get({
      title: data.title || "Untitled Event",
      start_at: data.start_at,
      end_at: data.end_at,
      all_day: data.all_day ? 1 : 0,
      linked_note_id: data.linked_note_id || null,
      linked_task_id: data.linked_task_id || null,
      recurrence_rule: data.recurrence_rule || null
    });
  });
  electron.ipcMain.handle("events:update", (_e, id, data) => {
    const fields = [];
    const values = { id };
    if (data.title !== void 0) {
      fields.push("title = @title");
      values.title = data.title;
    }
    if (data.start_at !== void 0) {
      fields.push("start_at = @start_at");
      values.start_at = data.start_at;
    }
    if (data.end_at !== void 0) {
      fields.push("end_at = @end_at");
      values.end_at = data.end_at;
    }
    if (data.all_day !== void 0) {
      fields.push("all_day = @all_day");
      values.all_day = data.all_day ? 1 : 0;
    }
    if (data.linked_note_id !== void 0) {
      fields.push("linked_note_id = @linked_note_id");
      values.linked_note_id = data.linked_note_id;
    }
    if (data.linked_task_id !== void 0) {
      fields.push("linked_task_id = @linked_task_id");
      values.linked_task_id = data.linked_task_id;
    }
    if (data.recurrence_rule !== void 0) {
      fields.push("recurrence_rule = @recurrence_rule");
      values.recurrence_rule = data.recurrence_rule;
    }
    if (fields.length === 0) return db2.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id);
    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    return db2.prepare(`
      UPDATE calendar_events SET ${fields.join(", ")} WHERE id = @id RETURNING *
    `).get(values);
  });
  electron.ipcMain.handle("events:delete", (_e, id) => {
    db2.prepare("DELETE FROM links WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)").run("event", id, "event", id);
    db2.prepare("DELETE FROM calendar_events WHERE id = ?").run(id);
  });
}
function registerFoldersIPC(db2) {
  electron.ipcMain.handle("folders:list", () => {
    return db2.prepare(`
      SELECT * FROM folders ORDER BY name ASC
    `).all();
  });
  electron.ipcMain.handle("folders:get", (_e, id) => {
    return db2.prepare("SELECT * FROM folders WHERE id = ?").get(id);
  });
  electron.ipcMain.handle("folders:create", (_e, data) => {
    const stmt = db2.prepare(`
      INSERT INTO folders (name, parent_id)
      VALUES (@name, @parent_id)
      RETURNING *
    `);
    return stmt.get({
      name: data.name || "New Folder",
      parent_id: data.parent_id || null
    });
  });
  electron.ipcMain.handle("folders:update", (_e, id, data) => {
    const fields = [];
    const values = { id };
    if (data.name !== void 0) {
      fields.push("name = @name");
      values.name = data.name;
    }
    if (data.parent_id !== void 0) {
      fields.push("parent_id = @parent_id");
      values.parent_id = data.parent_id;
    }
    if (data.is_expanded !== void 0) {
      fields.push("is_expanded = @is_expanded");
      values.is_expanded = data.is_expanded ? 1 : 0;
    }
    if (fields.length === 0) {
      return db2.prepare("SELECT * FROM folders WHERE id = ?").get(id);
    }
    fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
    const stmt = db2.prepare(`
      UPDATE folders SET ${fields.join(", ")} WHERE id = @id RETURNING *
    `);
    return stmt.get(values);
  });
  electron.ipcMain.handle("folders:delete", (_e, id) => {
    db2.prepare("DELETE FROM folders WHERE id = ?").run(id);
  });
  electron.ipcMain.handle("folders:getNotes", (_e, folderId) => {
    if (folderId === null) {
      return db2.prepare(`
        SELECT * FROM notes WHERE folder_id IS NULL ORDER BY updated_at DESC
      `).all();
    }
    return db2.prepare(`
      SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC
    `).all(folderId);
  });
}
function parseIcsEvents(content) {
  const events = [];
  const blocks = content.split("BEGIN:VEVENT");
  for (const block of blocks.slice(1)) {
    const summary = block.match(/SUMMARY:(.+)/)?.[1]?.trim();
    const dtStart = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/)?.[1];
    const dtEnd = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/)?.[1];
    if (!summary || !dtStart) continue;
    const parseIcsDate = (raw, isEnd = false) => {
      if (raw.length === 8) {
        const y2 = raw.slice(0, 4);
        const m = raw.slice(4, 6);
        const d = raw.slice(6, 8);
        const date = /* @__PURE__ */ new Date(`${y2}-${m}-${d}T${isEnd ? "23:59:59" : "00:00:00"}`);
        return date.toISOString();
      }
      const y = raw.slice(0, 4);
      const mo = raw.slice(4, 6);
      const da = raw.slice(6, 8);
      const h = raw.slice(9, 11) || "00";
      const mi = raw.slice(11, 13) || "00";
      return (/* @__PURE__ */ new Date(`${y}-${mo}-${da}T${h}:${mi}:00`)).toISOString();
    };
    const allDay = dtStart.length === 8;
    events.push({
      title: summary.replace(/\\n/g, " "),
      start_at: parseIcsDate(dtStart),
      end_at: parseIcsDate(dtEnd || dtStart, true),
      all_day: allDay
    });
  }
  return events;
}
function registerImportIPC(db2) {
  electron.ipcMain.handle("events:importIcs", async () => {
    const result = await electron.dialog.showOpenDialog({
      title: "Import calendar (.ics)",
      filters: [{ name: "iCalendar", extensions: ["ics"] }],
      properties: ["openFile"]
    });
    if (result.canceled || !result.filePaths[0]) {
      return { imported: 0 };
    }
    const content = fs.readFileSync(result.filePaths[0], "utf-8");
    const parsed = parseIcsEvents(content);
    const insert = db2.prepare(`
      INSERT INTO calendar_events (title, start_at, end_at, all_day)
      VALUES (@title, @start_at, @end_at, @all_day)
    `);
    const importMany = db2.transaction((items) => {
      for (const item of items) {
        insert.run({
          title: item.title,
          start_at: item.start_at,
          end_at: item.end_at,
          all_day: item.all_day ? 1 : 0
        });
      }
    });
    importMany(parsed);
    return { imported: parsed.length };
  });
}
function registerAllIPC(db2) {
  registerNotesIPC(db2);
  registerTasksIPC(db2);
  registerLinksIPC(db2);
  registerEventsIPC(db2);
  registerFoldersIPC(db2);
  registerImportIPC(db2);
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: "hiddenInset",
    titleBarOverlay: {
      color: "transparent",
      symbolColor: "#71717a",
      height: 38
    },
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  const db2 = initDatabase();
  registerAllIPC(db2);
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
