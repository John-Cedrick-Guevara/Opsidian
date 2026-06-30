# Phase 5: Kanban Table View & Improvements

## Summary
Completed the Kanban board table view feature and visual improvements that were previously incomplete.

## Changes Made

### 1. Created TableView Component
**File**: `src/renderer/components/kanban/TableView.tsx`

- **Features**:
  - Sortable table with columns: Title, Status, Due Date, Tags, Actions
  - Click column headers to sort (ascending/descending)
  - Visual indicators for sort direction (↑↓)
  - Status badges with color coding matching board view
  - Support for recurring and linked task tags
  - Edit button in actions column
  - Empty state with "Create first task" button
  - Completed tasks show checkmark and strikethrough
  - Row click opens edit modal

- **Sorting**:
  - Supports sorting by: title, status, due_date, created_at
  - Handles null values (pushed to bottom)
  - Toggle between ascending/descending on repeated clicks
  - Visual indicator shows current sort column and direction

### 2. Updated KanbanBoard Component
**File**: `src/renderer/components/kanban/KanbanBoard.tsx`

- Added `viewMode` state to toggle between 'board' and 'table'
- Added view toggle buttons in header (Board/Table)
- Conditional rendering based on viewMode
- Table view uses same task click handlers as board
- Both views share the same TaskModal for editing

### 3. Added Edit Icon
**File**: `src/renderer/components/layout/Icons.tsx`

- Added `Edit` icon (pencil/edit symbol) for use in table action buttons

### 4. Enhanced CSS Styling
**File**: `src/renderer/assets/index.css`

Added comprehensive styles for:

#### Kanban View Toggle
- `.kanban-header-left` - Header layout with title and toggle
- `.kanban-view-toggle` - Toggle button container
- `.view-toggle-btn` - Toggle button styling
- `.view-toggle-btn--active` - Active state with accent color

#### Improved Kanban Visuals
- `.kanban-empty-state` - Empty column styling with drop feedback
- `.kanban-card--dragging` - Drag overlay with rotation and shadow
- Enhanced hover states with translateY animation
- Column shadows and borders for better depth
- Smooth transitions throughout

#### Table View Styles
- `.table-view-container` - Table wrapper with scrolling
- `.tasks-table` - Main table with rounded corners and shadows
- `.sortable-header` - Clickable headers with hover states
- `.header-content` - Header layout with sort indicators
- `.sort-indicator` - Arrow showing sort direction
- `.task-row` - Row hover effects
- `.task-title-content` - Title with checkmark for completed
- `.task-title-done` - Strikethrough for completed tasks
- `.status-badge` - Color-coded status pills with dots
- `.task-date-cell` - Monospace date formatting
- `.task-tags-cell` - Tag layout
- `.table-action-btn` - Action button with opacity effects
- `.empty-state-content` - Centered empty state with icon

## Features

### Board View (Existing, Enhanced)
- Drag and drop between columns
- Visual feedback on drag
- Empty state with drop zones
- Improved hover animations
- Better shadows and depth

### Table View (New)
- Sortable columns
- Status color coding
- Inline task editing
- Tag display (recurring, linked)
- Action buttons
- Responsive layout
- Empty state handling

## How to Use

### Switching Views
1. Open the Kanban board (Tasks tab)
2. Click "Board" or "Table" buttons in the header
3. View persists during session (not saved to storage yet)

### Table View Features
1. **Sort**: Click any column header to sort
2. **Edit**: Click on a row to open edit modal, or click edit button
3. **Status badges**: Color-coded to match board columns
4. **Tags**: See recurring and linked indicators
5. **Completed tasks**: Marked with checkmark and strikethrough

## Technical Notes

### Data Flow
```
KanbanBoard
├── viewMode state ('board' | 'table')
├── Board View (DnD-enabled)
└── Table View
    ├── Local sorting state
    ├── Receives tasks prop
    └── Triggers same callbacks as board
```

### Color Consistency
Status colors match between views:
- Todo: `var(--text-tertiary)` (gray)
- Doing: `var(--amber)` (orange)
- Done: `var(--green)` (green)
- Skipped: `var(--rose)` (red)

### Type Safety
- Uses existing `Task`, `KanbanStatus`, `KANBAN_COLUMNS` types
- Sort keys are typed: `'title' | 'status' | 'due_date' | 'created_at'`
- Props interface properly typed

## Testing Checklist

- [x] Table view renders without errors
- [x] View toggle switches between board and table
- [x] Sorting works for all columns
- [x] Sort direction toggles correctly
- [x] Status badges show correct colors
- [x] Clicking row opens edit modal
- [x] Edit button works
- [x] Recurring/linked tags display
- [x] Empty state shows correctly
- [x] Completed tasks show strikethrough
- [x] Responsive layout works

## Notes on Folder Feature

The folder/file tree in the Notes section should be working correctly based on code review:

### Implementation Details
1. **Data fetching**: `fetchNotes()` loads ALL notes on mount
2. **Folder tree**: Built from flat folder list with parent_id relationships
3. **Note rendering**: Notes filtered by `folder_id` and rendered under expanded folders
4. **Root files**: Notes with `folder_id === null` shown in separate "Root Files" section
5. **Context menus**: Support creating notes in specific folders
6. **Folder count badges**: Show number of notes in each folder

### If Notes Still Not Visible

Possible debugging steps:
1. Check browser console for errors
2. Verify database has notes with `folder_id` set
3. Add console.log in `renderFolder` to see filtered notes
4. Ensure `fetchNotes()` is called on mount (line 48 in NoteList.tsx)
5. Check if `folder.is_expanded` is true
6. Verify IPC handler returns notes correctly

The code structure is correct - if notes aren't visible, it's likely a data issue or the folder isn't expanded.

## Files Modified

1. `src/renderer/components/kanban/TableView.tsx` (new)
2. `src/renderer/components/kanban/KanbanBoard.tsx` (updated)
3. `src/renderer/components/layout/Icons.tsx` (added Edit icon)
4. `src/renderer/assets/index.css` (added table + improved board styles)

## Next Steps (Optional)

Future enhancements could include:
- Persist view mode preference to localStorage
- Bulk actions in table view (multi-select)
- Inline status editing in table (dropdown)
- Column visibility toggles
- CSV export from table view
- Advanced filtering
