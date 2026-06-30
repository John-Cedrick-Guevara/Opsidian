# Opsidian — Local-First Workspace App

A local-first personal workspace combining a Notion-style rich text editor, Obsidian-style bi-directional linking with a visual graph, a Linear-grade kanban board with recurring tasks, and a Google Calendar–style scheduling view. All data lives on-device (SQLite), works fully offline, ships as a desktop app (Electron).

## Phase 1: Codebase Recon — Findings

### Existing Assets
The workspace currently contains only a [landing-page.html](file:///d:/2026%20Projects/SWE-projects/Opsidian/landing-page.html) (originally branded "Nerve") — a 2654-line React/Babel landing page with a complete design system:

**Reusable from the landing page:**
- **Design tokens** — CSS custom properties for light/dark themes (lines 15–71): `--bg`, `--accent`, `--border`, `--shadow-*`, `--radius-*`
- **Typography** — Inter + JetBrains Mono font pairing
- **Color palette** — Indigo accent, semantic colors (green/amber/rose/blue) with subtle variants
- **Component patterns** — app-window chrome, kanban cards, calendar grid, graph mock, wikilink styling, sidebar icons
- **Theme toggle** — light/dark with localStorage persistence and system preference detection

No AutoJournal project was accessible for cross-reference, so I'm designing the architecture fresh while following the same Electron + React + Vite + SQLite local-first philosophy.

### Confirmed Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Desktop shell** | Electron (latest) | Specified in prompt; mature, proven for local-first desktop apps |
| **Frontend framework** | React 19 | Latest stable; concurrent features for responsive UI |
| **Build tool** | Vite (via `electron-vite`) | Fast HMR, excellent Electron integration, handles native module externalization |
| **Database** | `better-sqlite3` | Synchronous API (ideal for main process), WAL mode, proven with Electron |
| **ORM/migrations** | Drizzle ORM | Type-safe schema, zero-overhead SQL generation, excellent migration tooling |
| **Rich text editor** | **Tiptap** (ProseMirror) | Mature extension ecosystem, JSON doc format (structured, not raw HTML), `[[` linking via custom extension |
| **Graph rendering** | **d3-force** (Canvas) | Handles 10k+ nodes; force-directed layout. React Flow struggles past ~200 nodes |
| **Drag-and-drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Modern, accessible, TypeScript-first, well-suited for kanban |
| **State management** | Zustand | Lightweight, works well with IPC-fetched data |
| **Recurrence** | `rrule` (rrule.js) | Standard RFC 5545 RRULE parsing/generation, shared across tasks + calendar |
| **Styling** | Vanilla CSS (design tokens from landing page) | Maximum control, reuses existing token system |

### High-Risk Technical Decisions — Confirmed

#### Rich Text Editor: Tiptap ✅
- **Why not Lexical?** Tiptap has a far larger extension ecosystem (tables, mentions, inline suggestions). The `[[` wikilink feature maps directly to a custom Tiptap extension using ProseMirror's `inputRules`. Lexical would require significantly more custom code for the same features.
- **Storage format:** Tiptap's native JSON doc format (ProseMirror schema). Structured, exportable, not raw HTML. This satisfies the constraint.
- **Autosave:** Debounced (500ms) writes via `editor.on('update')`, not per-keystroke.

#### Graph Rendering: d3-force on Canvas ✅
- **Why not React Flow?** The spec requires "performant at a few hundred nodes minimum" with a goal of 10k+. React Flow renders each node as a React component (DOM node), which breaks down past ~200-300 nodes. d3-force + Canvas rendering draws pixels directly — scales to thousands easily.
- **Integration:** Canvas element managed by React (`useRef`), d3-force simulation runs in a `requestAnimationFrame` loop. Click/hover detection via point-in-circle math on canvas coordinates.

### Mobile Strategy

> [!IMPORTANT]
> **Recommendation: Capacitor** for mobile (future phase). Here's the tradeoff:
>
> | | Capacitor | React Native |
> |---|---|---|
> | **Code reuse** | ~90-100% of React UI | Requires rewriting all UI components |
> | **SQLite** | `@capacitor-community/sqlite` | `expo-sqlite` (different API) |
> | **Time to ship** | Weeks | Months |
> | **Native feel** | Good (WebView) | Excellent (native components) |
> | **Risk** | Performance ceiling for complex animations | Separate codebase divergence |
>
> For a data-driven productivity app (not a game or animation-heavy app), Capacitor's WebView approach is more than adequate and lets us reuse the entire React codebase. The data layer should abstract over `better-sqlite3` (Electron) vs `@capacitor-community/sqlite` (mobile) behind a shared interface.

---

## Phase 2: Data Model

### SQLite Schema

```sql
-- Enable WAL mode for better read/write concurrency
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE notes (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title         TEXT NOT NULL DEFAULT 'Untitled',
  body          TEXT NOT NULL DEFAULT '{}',   -- Tiptap JSON doc
  font_size     REAL,                          -- nullable override
  color         TEXT,                          -- nullable override
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE tasks (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title           TEXT NOT NULL DEFAULT 'Untitled Task',
  description     TEXT DEFAULT '{}',            -- Tiptap JSON doc (task body is also a rich editor)
  status          TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','doing','done','skipped')),
  kanban_position REAL NOT NULL DEFAULT 0,      -- fractional indexing for ordering
  recurrence_rule TEXT,                          -- RRULE string (RFC 5545), nullable
  due_date        TEXT,                          -- ISO date, nullable
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
  start_at        TEXT NOT NULL,                -- ISO datetime
  end_at          TEXT NOT NULL,                -- ISO datetime
  all_day         INTEGER NOT NULL DEFAULT 0,   -- boolean
  linked_note_id  TEXT REFERENCES notes(id) ON DELETE SET NULL,
  linked_task_id  TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  recurrence_rule TEXT,                          -- shared RRULE format
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Indices for common queries
CREATE INDEX idx_links_source ON links(source_type, source_id);
CREATE INDEX idx_links_target ON links(target_type, target_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_events_range ON calendar_events(start_at, end_at);
```

### Key Design Decisions
- **Fractional indexing** for `kanban_position` (e.g., 0.5 between 0 and 1) enables drag-and-drop reordering without updating every row
- **Links table** is generic (source/target can be note, task, or event) — bi-directional resolution at query time via `WHERE (source_id = ? OR target_id = ?)`
- **Tiptap JSON** stored as TEXT — parsed in the renderer, no HTML in the DB
- **Recurrence rule** is a shared RRULE string across tasks and events — one parser (`rrule.js`), one behavior

### Recurring Task Behavior
When a recurring task is marked **Done**:
1. The current task instance keeps `status = 'done'` (historical record)
2. A **new task** is generated with `status = 'todo'`, same title/description/recurrence_rule, `due_date` advanced per RRULE
3. The `links` from the original task are **not** carried to the new instance (clean slate)
4. When marked **Skipped**: same as Done — generates next occurrence, but original keeps `status = 'skipped'`

---

## Phase 3: Architecture

### Electron Process Architecture

```
┌─────────────────────────────────────────────┐
│  Main Process (Node.js)                     │
│  ├── better-sqlite3 (DB connection)         │
│  ├── IPC handlers (CRUD for all entities)   │
│  ├── Recurrence engine (rrule.js)           │
│  └── File system / app lifecycle            │
├─────────────────────────────────────────────┤
│  Preload Script (contextBridge)             │
│  └── Exposes: window.opsidian.db.*          │
├─────────────────────────────────────────────┤
│  Renderer Process (React + Vite)            │
│  ├── Zustand stores (notes, tasks, events)  │
│  ├── Tiptap editor                          │
│  ├── d3-force graph (Canvas)                │
│  ├── dnd-kit kanban board                   │
│  ├── Calendar views                         │
│  └── Command palette (Cmd+K)               │
└─────────────────────────────────────────────┘
```

### IPC API Surface

```typescript
// All DB operations go through these IPC channels
interface OpsidianAPI {
  // Notes
  notes: {
    list(): Promise<Note[]>;
    get(id: string): Promise<Note>;
    create(data: Partial<Note>): Promise<Note>;
    update(id: string, data: Partial<Note>): Promise<Note>;
    delete(id: string): Promise<void>;
    search(query: string): Promise<Note[]>;
  };
  // Tasks
  tasks: {
    list(filter?: { status?: string }): Promise<Task[]>;
    get(id: string): Promise<Task>;
    create(data: Partial<Task>): Promise<Task>;
    update(id: string, data: Partial<Task>): Promise<Task>;
    delete(id: string): Promise<void>;
    reorder(id: string, newPosition: number, newStatus?: string): Promise<Task>;
    complete(id: string): Promise<{ completed: Task; next?: Task }>; // handles recurrence
  };
  // Links
  links: {
    create(source: LinkRef, target: LinkRef): Promise<Link>;
    delete(id: string): Promise<void>;
    getForEntity(type: string, id: string): Promise<Link[]>;
    getGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  };
  // Calendar
  events: {
    list(start: string, end: string): Promise<CalendarEvent[]>;
    create(data: Partial<CalendarEvent>): Promise<CalendarEvent>;
    update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent>;
    delete(id: string): Promise<void>;
  };
}
```

---

## Phase 4: Proposed File Structure

```
d:\2026 Projects\SWE-projects\Opsidian\
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
├── landing-page.html                    # existing, untouched
│
├── src/
│   ├── main/                            # Electron main process
│   │   ├── index.ts                     # app entry, window creation
│   │   ├── database.ts                  # SQLite connection, migrations
│   │   ├── ipc/                         # IPC handler registrations
│   │   │   ├── notes.ts
│   │   │   ├── tasks.ts
│   │   │   ├── links.ts
│   │   │   ├── events.ts
│   │   │   └── index.ts
│   │   └── recurrence.ts               # Shared rrule logic
│   │
│   ├── preload/
│   │   └── index.ts                     # contextBridge API exposure
│   │
│   └── renderer/                        # React app
│       ├── index.html
│       ├── main.tsx                     # React root
│       ├── App.tsx                      # Router + layout shell
│       │
│       ├── assets/
│       │   └── index.css                # Design system (tokens from landing page)
│       │
│       ├── stores/                      # Zustand stores
│       │   ├── useNotesStore.ts
│       │   ├── useTasksStore.ts
│       │   ├── useEventsStore.ts
│       │   ├── useLinksStore.ts
│       │   └── useUIStore.ts            # sidebar, theme, command palette
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx          # Icon sidebar (Notes/Graph/Kanban/Calendar)
│       │   │   ├── NoteList.tsx         # Secondary note list panel
│       │   │   ├── CommandPalette.tsx   # Cmd+K modal
│       │   │   └── ThemeToggle.tsx
│       │   │
│       │   ├── editor/
│       │   │   ├── Editor.tsx           # Tiptap editor wrapper
│       │   │   ├── Toolbar.tsx          # Formatting toolbar
│       │   │   ├── WikilinkExtension.ts # Custom [[ ]] Tiptap extension
│       │   │   └── BacklinksPanel.tsx   # Linked mentions sidebar
│       │   │
│       │   ├── graph/
│       │   │   ├── GraphView.tsx        # Canvas + d3-force
│       │   │   └── GraphControls.tsx    # Zoom, filter controls
│       │   │
│       │   ├── kanban/
│       │   │   ├── KanbanBoard.tsx      # dnd-kit board
│       │   │   ├── KanbanColumn.tsx
│       │   │   ├── KanbanCard.tsx
│       │   │   └── RecurrencePicker.tsx # RRULE frequency selector
│       │   │
│       │   └── calendar/
│       │       ├── CalendarView.tsx     # Month/week/day views
│       │       ├── CalendarGrid.tsx
│       │       ├── EventModal.tsx       # Create/edit event
│       │       └── DayCell.tsx
│       │
│       ├── hooks/
│       │   ├── useTheme.ts
│       │   ├── useKeyboard.ts          # Global keyboard shortcuts
│       │   └── useDebounce.ts
│       │
│       └── types/
│           └── index.ts                # Shared TypeScript interfaces
```

---

## Phase 5: Implementation Order

### Build Wave 1 — Foundation (Scaffold + DB + Shell)
1. Initialize Electron + Vite + React project with `electron-vite`
2. Set up SQLite with `better-sqlite3`, create schema, run migrations
3. Implement IPC handlers for all CRUD operations
4. Build the app shell: sidebar navigation, theme toggle, layout grid
5. Port design tokens from landing page into `index.css`

### Build Wave 2 — Editor + Linking
6. Integrate Tiptap with bold/italic/heading/font-size/font-color
7. Build the wikilink `[[` extension (custom InputRule + Node)
8. Implement note creation, listing, autosave (debounced)
9. Build the backlinks panel (query `links` table for incoming references)

### Build Wave 3 — Graph
10. Implement `getGraph()` IPC handler (aggregate notes + tasks + links)
11. Build Canvas-based graph view with d3-force simulation
12. Add click-to-navigate, hover-to-preview, zoom/pan controls

### Build Wave 4 — Kanban
13. Build kanban board with `@dnd-kit`
14. Implement drag-and-drop reordering + column transitions
15. Implement recurrence picker and the "complete → regenerate" flow
16. Wire task ↔ note linking

### Build Wave 5 — Calendar
17. Build month view with event display
18. Add week and day views
19. Implement event creation modal with note/task linking
20. Wire recurring events (same RRULE engine as tasks)

### Build Wave 6 — Polish
21. Command palette (Cmd+K) for quick navigation/creation
22. Keyboard shortcuts (Linear-style: `C` new note, `T` new task, `1-4` switch views)
23. Responsive polish, animations, micro-interactions
24. Performance testing (graph at 500+ nodes, editor save latency)

---

## Open Questions

> [!IMPORTANT]
> **App name:** The landing page uses "Nerve" but the workspace folder is "Opsidian." Which name should the app use internally? I'll proceed with **Opsidian** unless you say otherwise.

> [!IMPORTANT]
> **Editor toolbar style:** The spec says "appears on selection or in a slim persistent top bar — decide one and be consistent." I recommend a **slim persistent top bar** (like Notion's) that's always visible above the editor — it's more discoverable and consistent. Alternatively, a floating bubble toolbar on text selection is more minimal. Which do you prefer?

> [!IMPORTANT]
> **Graph node types:** Should the graph distinguish between notes, tasks, and calendar events visually (different shapes/colors per type), or treat all nodes uniformly? I recommend **visual differentiation** (circles for notes, rounded squares for tasks, diamonds for events).

---

## Verification Plan

### Automated Tests
```bash
# Run the dev server to verify HMR and rendering
npm run dev

# Verify Electron builds correctly
npm run build
```

### Manual Verification
- Create notes with formatting, verify autosave to SQLite
- Type `[[` to create wikilinks, verify backlinks panel updates
- Open graph view, verify nodes/edges match the links table
- Drag tasks across kanban columns, verify position persists
- Create calendar events, link to notes, verify navigation
- Test offline behavior (disconnect network, verify all operations work)
- Test with 500+ notes to verify graph performance
