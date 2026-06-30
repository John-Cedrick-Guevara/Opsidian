# Opsidian

A local-first desktop workspace for notes, tasks, and a graph that's actually yours. No account, no cloud lock-in — everything stays on your device.

This repo contains two projects:

| Project | Path | Stack |
|---------|------|-------|
| **Desktop app** | `/` (root) | Electron, React, TypeScript, SQLite |
| **Landing page** | `/landing-page` | React, Vite |

---

## Features

- **Rich editor** — Tiptap-based writing with slash commands, wikilinks (`[[note]]`), and a floating toolbar
- **Bi-directional linking** — backlinks panel, clickable wikilinks, live graph updates
- **Graph view** — force-directed layout (d3-force), filters, hover previews
- **Kanban** — drag-and-drop board with recurring tasks and tags
- **Calendar** — event creation, ICS import, links back to notes
- **Folders** — organize notes with drag-and-drop
- **Local-first** — SQLite database in the OS user data directory, works offline

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- **Windows:** Visual Studio Build Tools (for `better-sqlite3` native compilation)
- **macOS:** Xcode Command Line Tools

---

## Getting started — desktop app

```bash
# From the repo root
npm install
npm run dev
```

This starts Electron with hot reload via [electron-vite](https://electron-vite.org/).

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run the app in development mode |
| `npm run build` | Compile main, preload, and renderer to `out/` |
| `npm run preview` | Preview the production build |
| `npm run dist` | Build + package for the current OS |
| `npm run dist:win` | Build + produce Windows NSIS installer |

Production output goes to `release/` (gitignored). Windows installer: `release/Opsidian-0.1.0-win.exe`.

> **Note:** The Windows build is unsigned. SmartScreen / Defender may flag it. See [landing-page/public/releases/README.md](landing-page/public/releases/README.md) for distribution notes.

---

## Getting started — landing page

```bash
cd landing-page
npm install
npm run dev
```

Open http://localhost:5173. See [landing-page/README.md](landing-page/README.md) for deployment, theming, and download setup.

To wire up the Windows download button:

1. Run `npm run dist:win` from the repo root
2. Copy the installer to `landing-page/public/releases/Opsidian-0.1.0-win.exe`

---

## Project structure

```
Opsidian/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Window creation, app lifecycle
│   │   ├── database.ts    # SQLite init + migrations
│   │   ├── ipc/           # IPC handlers (notes, tasks, links, events, folders)
│   │   └── recurrence.ts  # RRULE logic for recurring tasks
│   ├── preload/
│   │   └── index.ts       # contextBridge API → window.opsidian
│   └── renderer/          # React UI
│       ├── App.tsx
│       ├── components/    # editor, graph, kanban, calendar, layout
│       ├── stores/        # Zustand stores
│       └── types/
├── landing-page/          # Marketing site (separate package.json)
├── resources/
│   └── icon.png           # App icon for electron-builder
├── docs/                  # Design notes and phase summaries
├── out/                   # Compiled app (gitignored)
└── release/               # Installers (gitignored)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Renderer (React + Zustand)                             │
│  Editor · Graph · Kanban · Calendar · NoteList          │
└───────────────────────┬─────────────────────────────────┘
                        │ window.opsidian.* (IPC)
┌───────────────────────▼─────────────────────────────────┐
│  Preload (contextBridge)                                │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│  Main process (Node.js)                                 │
│  IPC handlers · better-sqlite3 · file dialogs           │
└─────────────────────────────────────────────────────────┘
```

### IPC surface

The preload script exposes a typed API on `window.opsidian`:

- `notes` — CRUD, search
- `folders` — CRUD, list notes in folder
- `tasks` — CRUD, reorder, complete (with recurrence)
- `links` — create/delete links, fetch graph data
- `events` — CRUD, ICS import

Renderer stores call these methods and keep UI state in Zustand.

### Data storage

- Database file: `{userData}/data/opsidian.db` (via Electron `app.getPath('userData')`)
- Migrations run automatically on startup — see `src/main/database.ts`
- Note bodies are stored as Tiptap JSON (ProseMirror doc format)

### Native modules

`better-sqlite3` is a native addon. It is:

- Externalized in the main process build
- Unpacked from the asar archive in production (`asarUnpack` in `package.json`)

If `npm install` fails on Windows, install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) or the VS C++ workload, then re-run install.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1` | Notes view |
| `2` | Graph view |
| `3` | Kanban view |
| `4` | Calendar view |
| `C` | Create new note |

Shortcuts are disabled while focus is in an input or the editor.

---

## Development tips

### Adding a new IPC endpoint

1. Add the handler in `src/main/ipc/`
2. Register it in `src/main/ipc/index.ts`
3. Expose it in `src/preload/index.ts`
4. Call it from a Zustand store or component in the renderer

### Theming

Both the app and landing page use CSS custom properties (`--bg`, `--accent`, etc.) with a `data-theme="dark"` attribute on `<html>`. Match existing token names when adding styles.

### Path alias

The renderer supports `@renderer/*` → `src/renderer/*` (configured in `electron.vite.config.ts`).

---

## Additional documentation

| Doc | Description |
|-----|-------------|
| [landing-page/README.md](landing-page/README.md) | Landing page setup, deployment, customization |
| [landing-page/public/releases/README.md](landing-page/public/releases/README.md) | Building and hosting installers |
| [docs/plan.md](docs/plan.md) | Original architecture and stack decisions |
| [docs/](docs/) | Phase summaries, feature guides, debugging notes |

---

## Contributing

1. Fork the repo and create a feature branch
2. Run `npm run dev` and verify your changes
3. Keep diffs focused — match existing patterns in the file you're editing
4. Open a pull request with a clear description of what changed and why

Bug reports and feature ideas are welcome via GitHub Issues.

---

## License

MIT — see the repository for details.
