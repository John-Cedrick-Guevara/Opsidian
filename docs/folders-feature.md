# Folders Feature Documentation

## Overview
The Folders feature allows users to organize their notes into a hierarchical folder structure with support for subfolders. This provides better organization for large collections of notes.

## Features Implemented

### 1. Database Schema
- **New `folders` table**:
  - `id`: Unique identifier
  - `name`: Folder name
  - `parent_id`: Reference to parent folder (for subfolder support)
  - `is_expanded`: UI state for folder tree expansion
  - `created_at` / `updated_at`: Timestamps

- **Updated `notes` table**:
  - Added `folder_id` column to associate notes with folders
  - Foreign key with `ON DELETE SET NULL` (notes return to root when folder is deleted)

### 2. Backend (Main Process)
- **New IPC handlers** (`src/main/ipc/folders.ts`):
  - `folders:list` - Get all folders
  - `folders:get` - Get single folder
  - `folders:create` - Create new folder
  - `folders:update` - Update folder properties
  - `folders:delete` - Delete folder (cascades to subfolders)
  - `folders:getNotes` - Get notes in a specific folder

- **Updated notes IPC**:
  - Modified `notes:create` to support `folder_id`
  - Modified `notes:update` to support moving notes between folders

### 3. Frontend (Renderer Process)

#### Store (`src/renderer/stores/useFoldersStore.ts`)
- Manages folder state and operations
- Methods: `fetchFolders`, `createFolder`, `updateFolder`, `deleteFolder`, `toggleExpanded`

#### Updated Notes Store
- Added `currentFolderId` state
- New method `fetchNotesInFolder` to filter notes by folder
- Updated `createNote` to default to current folder
- Move notes between folders via `updateNote`

#### UI Component (`src/renderer/components/layout/NoteList.tsx`)
Enhanced to display:
- **Folder tree** with expand/collapse functionality
- **"All Notes" root** view to see all notes
- **Context menus** for:
  - Folders: Create subfolder, Rename, Delete
  - Notes: Move to folder
  - Root: Create new folder
- **Inline rename** of folders with Escape/Enter support
- **Visual hierarchy** with proper indentation for subfolders

#### New Icons
Added to `Icons.tsx`:
- `Folder` - Folder icon
- `FolderPlus` - New folder icon
- `ChevronDown` - Expanded folder indicator
- `Home` - Root/All notes icon

### 4. Styling
New CSS classes in `index.css`:
- `.folder-item` - Folder list item styling
- `.folder-item--active` - Active folder state
- `.folder-toggle` - Expand/collapse button
- `.context-menu` - Right-click menu
- `.context-menu-item` - Menu item styling
- `.context-menu-item--danger` - Delete action styling

## User Interactions

### Creating Folders
1. Click the folder+ icon in the notes header to create a root folder
2. Right-click on a folder → "New Subfolder" to create nested folders
3. Right-click on root → "New Folder" for quick access

### Organizing Notes
1. Create notes normally - they'll be added to the current folder
2. Right-click a note → "Move to folder" to relocate it
3. Select "Root" to move notes out of folders

### Managing Folders
1. Click a folder to view its notes
2. Click expand/collapse arrow to show/hide subfolders
3. Right-click → "Rename" to edit folder name (or click while selected)
4. Right-click → "Delete" to remove folder (notes move to root)

### Navigation
- Click "All Notes" to see all notes regardless of folder
- Click a folder to filter notes to that folder
- Search still works across all notes

## Database Migration
The database automatically runs migration `002_add_folders` on next app start. Existing notes remain in the root level (folder_id = NULL).

## Technical Notes

### Folder Hierarchy
- Unlimited nesting depth supported
- Deleting a folder deletes all subfolders (CASCADE)
- Notes in deleted folders move to root (SET NULL)

### Performance
- Folders are loaded once on app start
- Notes are filtered by folder_id via indexed queries
- Expand/collapse state persists to database

### Type Safety
- `Folder` type exported from `types/index.ts`
- Full type coverage for IPC channels via preload bridge
- TypeScript ensures proper folder_id handling in notes

## Future Enhancements
Possible improvements:
- Drag-and-drop notes into folders
- Drag-and-drop folder reordering
- Folder colors/icons
- Folder-specific settings (default note template, etc.)
- Bulk move operations
- Folder search/filter
