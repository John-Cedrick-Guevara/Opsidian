# File Explorer Usage Guide

## VS Code-Style File Explorer

The notes sidebar now works exactly like VS Code's file explorer with full folder support.

## Creating Files & Folders

### Create Note in Folder
1. Right-click on any folder
2. Select "📄 New Note in Folder"
3. Note appears immediately under the folder
4. Start typing to edit

### Create Subfolder
1. Right-click on any folder
2. Select "📁 New Subfolder"
3. Type folder name
4. Press Enter to save

### Create Root-Level Items
1. Right-click on empty space in sidebar
2. Choose "New Note" or "New Folder"
3. Item appears at root level

### Quick Create
- Click "📁+" button in header → New folder in current location
- Click "➕" button in header → New note in current location

## Navigating the Tree

### Expanding/Collapsing Folders
- Click the **arrow** (▶/▼) to expand/collapse
- Click the **folder name** to select it
- Expanded folders show:
  - All notes inside them
  - All subfolders
  
### Visual Structure
```
▼ 📁 Work Projects          ← Click arrow to collapse
  📄 Meeting Notes.md        ← Notes in folder
  📄 TODO.md
  ▼ 📁 Client A              ← Subfolder
    📄 Proposal.md
    📄 Contract.md
  ▶ 📁 Client B              ← Collapsed subfolder
▼ 📁 Personal
  📄 Journal.md

---
ROOT FILES
📄 Quick Notes.md
📄 Untitled Note
```

## Managing Files

### Moving Notes
1. Right-click on a note
2. Select "Move to folder"
3. Choose destination folder
4. Note moves instantly

### Renaming Folders
1. Right-click folder
2. Select "Rename"
3. Type new name
4. Press Enter (or Escape to cancel)

### Deleting Folders
1. Right-click folder
2. Select "Delete"
3. Confirm deletion
4. Notes inside move to root level
5. Subfolders are deleted

## Keyboard Shortcuts

- **Search**: `Cmd/Ctrl + K`
- **New Note**: `C` (when sidebar focused)
- **Arrow Keys**: Navigate items
- **Enter**: Open selected note
- **Escape**: Cancel rename

## Context Menus

### Folder Context Menu
```
📁 Folder Name
├─ 📄 New Note in Folder
├─ 📁 New Subfolder
├─ ─────────────
├─ ✏️  Rename
└─ 🗑️  Delete
```

### Note Context Menu
```
📄 Note Name
├─ Move to folder:
├─ 📁 Root
├─ 📁 Work Projects
├─ 📁 Personal
└─ 📁 Archive
```

### Empty Space Context Menu
```
(Right-click empty area)
├─ 📄 New Note
└─ 📁 New Folder
```

## Visual Indicators

### Icons
- `▶` = Collapsed folder
- `▼` = Expanded folder
- `📁` = Folder
- `📄` = Note/File

### Highlighting
- **Blue background** = Selected/active item
- **Gray background** = Hover state
- **Bold text** = Currently editing note

### Indentation
- Each level indents 20px
- Clear visual hierarchy
- Easy to see parent-child relationships

## Tips & Tricks

### Organizing Large Projects
```
📁 Project Name
  📁 01-Planning
    📄 Requirements.md
    📄 Brainstorming.md
  📁 02-Development
    📄 Architecture.md
    📄 Progress.md
  📁 03-Documentation
    📄 API Docs.md
    📄 User Guide.md
```

### Quick Access Structure
```
📁 Active Projects (expanded by default)
📁 Archive (collapsed, for old stuff)
📁 Templates (reusable note templates)

---
ROOT FILES
📄 Daily Journal
📄 Quick Capture
```

### Flat vs Nested
**Flat Structure** (easier to scan):
```
📄 Note 1
📄 Note 2
📄 Note 3
📄 Note 4
```

**Nested Structure** (better organized):
```
📁 Category A
  📄 Note 1
  📄 Note 2
📁 Category B
  📄 Note 3
  📄 Note 4
```

## Troubleshooting

### "I can't see my notes"
- Make sure the folder is expanded (▼ not ▶)
- Check if you're in search mode (clear search)
- Verify notes exist (check database)

### "Right-click doesn't work"
- Make sure you're clicking directly on the item
- Not on empty space between items
- Try clicking and holding briefly

### "New note doesn't appear"
- It should appear immediately under the folder
- Expand the folder to see it
- Check if it's in ROOT FILES section

### "Drag and drop doesn't work"
- Currently not implemented
- Use "Move to folder" context menu instead
- Drag & drop coming in future update

## Comparison with Other Apps

### Similar to VS Code
- ✅ Hierarchical tree view
- ✅ Expand/collapse folders
- ✅ Indentation levels
- ✅ Context menus
- ✅ Inline rename
- ✅ File icons

### Similar to Notion
- ✅ Nested pages/databases
- ✅ Drag to reorder (coming soon)
- ✅ Quick access

### Similar to Obsidian
- ✅ Folder-based organization
- ✅ File explorer
- ✅ Quick switcher (search)

## Workflow Examples

### Daily Notes Workflow
```
📁 Daily Notes
  📁 2026
    📁 June
      📄 2026-06-01.md
      📄 2026-06-02.md
      📄 2026-06-03.md
```

**Steps**:
1. Right-click "June" folder
2. "New Note in Folder"
3. Rename to today's date
4. Start writing

### Project Management
```
📁 Projects
  📁 Website Redesign
    📄 Requirements.md
    📄 Wireframes.md
    📁 Meeting Notes
      📄 2026-06-01 Kickoff.md
      📄 2026-06-10 Review.md
```

**Steps**:
1. Create "Projects" folder
2. Create project subfolder
3. Add notes as you work
4. Organize in subfolders when needed

### Knowledge Base
```
📁 Programming
  📁 JavaScript
    📄 Array Methods.md
    📄 Async Await.md
  📁 Python
    📄 List Comprehensions.md
📁 Design
  📄 Color Theory.md
  📄 Typography.md
```

**Steps**:
1. Create topic folders
2. Add subtopics as needed
3. Link related notes with [[wikilinks]]
4. View connections in graph

## Best Practices

### ✅ Do
- Use clear, descriptive folder names
- Keep folder depth reasonable (3-4 levels max)
- Group related notes together
- Use consistent naming conventions
- Expand folders you're actively working in

### ❌ Don't
- Create too many nested levels (hard to navigate)
- Use very long folder names
- Mix archived and active content
- Leave notes at root when they have a clear category
- Create folders for just one note

## Future Features (Coming Soon)

- 🚧 Drag & drop reordering
- 🚧 Folder colors/icons
- 🚧 Starred/pinned files
- 🚧 Bulk operations
- 🚧 Folder templates
- 🚧 Keyboard-only navigation
- 🚧 Search within folder
- 🚧 Sort options (name, date, manual)

## Need Help?

If you encounter issues:
1. Check this guide first
2. Try restarting the app
3. Check the developer console (F12)
4. Report bugs on GitHub

Happy organizing! 📁✨
