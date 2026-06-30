# Project Roadmap & Phases

This document outlines the development phases and roadmap for **Opsidian**, a local-first personal workspace combining Notion-style editing, Obsidian-style linking, Kanban boards, and calendar views.

---

## Phase 1: Desktop Application MVP (Completed)
Establish the local-first desktop application with all core workspaces operating offline-first.

### Core Foundation
- [x] **Desktop Shell:** Electron + Vite + React 19 architecture with type-safe context isolation preload bridging.
- [x] **Local Data Layer:** `better-sqlite3` SQLite database configured in WAL mode, indices, and automated migration management.
- [x] **Theming & Token Design:** Integrated light and dark CSS themes, custom titlebars, and micro-interactions.

### Surface Features
- [x] **Rich Text Editor:** Tiptap integration with custom Markdown input rules, 500ms debounced autosave, and inline `[[wikilink]]` references.
- [x] **Bi-directional Reference Engine:** real-time backlinks extraction and bi-directional edges database updates.
- [x] **Force-Directed Link Graph:** performant Canvas graph visualizer utilising `d3-force` rendering node categories by shapes (Notes, Tasks, Events) with zoom, pan, and coordinate dragging.
- [x] **Linear-grade Kanban:** `@dnd-kit` multi-column task board using fractional indexes for reordering, combined with RFC 5545 task recurrence loops.
- [x] **Google Calendar View:** Month calendar mapping static events and resolving recurring event patterns on the fly.
- [x] **Keyboard UX:** Global shortcuts and custom `Cmd+K` command palette for fuzzy search navigation.

---

## Phase 2: Mobile Build (Future Target)
Port the application to mobile devices maintaining a unified codebase and offline-first database.

### Capacitor Port
- [ ] **Capacitor Configuration:** Wrap the React build inside native Android and iOS wrappers.
- [ ] **Mobile SQLite Adapter:** Abstract the database interface to switch between `better-sqlite3` (desktop) and `@capacitor-community/sqlite` (mobile).
- [ ] **Touch Optimizations:** Adjust `dnd-kit` sensors for mobile gestures, refine canvas swipe transforms, and replace hover tooltips with touch sheets.
- [ ] **Responsive Navigation:** Design a mobile-friendly slide-out drawer sidebar and bottom tab bar.
- [ ] **iOS Safe Areas:** Handle device safe area padding, notches, and status bars.

---

## Phase 3: Local-First Synchronization & Backups
Add multi-device synchronization and document backup capability without compromising local ownership.

### Encrypted Sync Protocol
- [ ] **End-to-End Encryption (E2EE):** Encrypt SQLite sync logs using user-controlled passkeys (AES-256-GCM) before syncing.
- [ ] **CRDT Merging:** Integrate conflict-free replicated data types (e.g., Yjs or Automerge) to handle concurrent edits seamlessly.
- [ ] **S3 Backup Sync:** Expose configurations to let users sync databases to private storage endpoints (S3, Cloudflare R2, MinIO).
- [ ] **JSON Import/Export:** Support importing Obsidian vault markdown folders and exporting the database as structured files.

---

## Phase 4: Extended Customization & Plugins
Extend the application framework to support third-party themes, customization, and file attachments.

### Custom Styling & Media
- [ ] **Local Attachment Storage:** Support dragging images, PDFs, and files into the editor, copying them to local storage folders.
- [ ] **Custom CSS Themes:** Allow users to write custom styles and styling injections directly in settings.
- [ ] **Extended Command API:** Expose plugin interfaces so developers can register custom commands and toolbar shortcuts.
- [ ] **ICS Calendar Import:** Enable importing external `.ics` calendars to display side-by-side with local events.
