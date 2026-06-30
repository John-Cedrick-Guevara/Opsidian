# Debugging Guide: Notes Not Visible in Folders

## Problem
User reports: "I can't see the files inside a folder"

## Expected Behavior
When a folder is expanded in the Notes sidebar, all notes with that `folder_id` should be visible nested under the folder.

## Code Analysis

### Data Flow
1. **On Mount** (`NoteList.tsx` line 48):
   ```typescript
   useEffect(() => {
     const initialize = async () => {
       await fetchFolders()
       await fetchNotes() // This loads ALL notes
     }
     initialize()
   }, [])
   ```

2. **fetchNotes** (`useNotesStore.ts` line 19):
   ```typescript
   fetchNotes: async () => {
     const list = await window.opsidian.notes.list()
     set({ notes: list }) // Stores ALL notes in state
   }
   ```

3. **Folder Rendering** (`NoteList.tsx` line 169):
   ```typescript
   const folderNotes = notes.filter(n => n.folder_id === folder.id)
   ```
   Filters all notes for those belonging to this folder.

4. **Note Rendering** (`NoteList.tsx` line 201):
   ```typescript
   {folder.is_expanded && (
     <>
       {folderNotes.map((note) => ( ... ))}
       {folder.children.map((child) => renderFolder(child, depth + 1))}
     </>
   )}
   ```
   Only renders notes when folder is expanded.

## Debugging Steps

### Step 1: Check Database
Open the database file at `%APPDATA%/Opsidian/data/opsidian.db` using SQLite browser:

```sql
-- Check if notes exist
SELECT id, title, folder_id FROM notes;

-- Check if folders exist
SELECT id, name, parent_id FROM folders;

-- Check notes in a specific folder
SELECT * FROM notes WHERE folder_id = 'your-folder-id-here';
```

Expected:
- Notes should have `folder_id` column populated
- `folder_id` should match existing folder IDs

### Step 2: Browser DevTools Console
Open DevTools (F12) and check for:

1. **Errors**: Any red error messages?
2. **Network/IPC**: Are notes being fetched?

Add debug logging to `NoteList.tsx`:

```typescript
const renderFolder = (folder: Folder & { children: Folder[] }, depth = 0) => {
  const folderNotes = notes.filter(n => n.folder_id === folder.id)
  
  // ADD THIS DEBUG LOG
  console.log(`Folder "${folder.name}" (${folder.id}):`, {
    isExpanded: folder.is_expanded,
    notesCount: folderNotes.length,
    notes: folderNotes.map(n => n.title),
    allNotes: notes.length
  })
  
  return (
    // ... rest of component
  )
}
```

### Step 3: Check Folder Expansion
Folders must be expanded to show notes. Check:

1. Click the chevron icon next to folder name
2. Verify `folder.is_expanded` is `true` in database:
   ```sql
   SELECT id, name, is_expanded FROM folders;
   ```
3. If `is_expanded` is 0, update it:
   ```sql
   UPDATE folders SET is_expanded = 1 WHERE id = 'your-folder-id';
   ```

### Step 4: Test Note Creation in Folder

1. Right-click on a folder
2. Select "New Note in Folder"
3. Check if note appears
4. Verify in DevTools console that note was created with correct `folder_id`

### Step 5: Verify IPC Handler

The IPC handler should return ALL notes, including their `folder_id`:

```typescript
// src/main/ipc/notes.ts
ipcMain.handle('notes:list', () => {
  return db.prepare(`
    SELECT * FROM notes ORDER BY updated_at DESC
  `).all()
})
```

Test by adding logging:
```typescript
ipcMain.handle('notes:list', () => {
  const notes = db.prepare(`
    SELECT * FROM notes ORDER BY updated_at DESC
  `).all()
  console.log('[IPC] notes:list returned', notes.length, 'notes')
  return notes
})
```

## Common Issues & Fixes

### Issue 1: Notes Created Before Folders Feature
**Symptom**: Old notes don't appear anywhere
**Cause**: Notes created before migration have no `folder_id` column
**Fix**: They should appear in "Root Files" section at bottom

### Issue 2: Folder Not Expanded
**Symptom**: Folder shows count but no notes visible
**Cause**: `is_expanded` is false
**Fix**: Click chevron to expand folder

### Issue 3: Wrong folder_id
**Symptom**: Notes appear in wrong folder or not at all
**Cause**: Note's `folder_id` doesn't match any folder
**Fix**: 
```sql
-- Find orphaned notes
SELECT n.id, n.title, n.folder_id
FROM notes n
LEFT JOIN folders f ON n.folder_id = f.id
WHERE n.folder_id IS NOT NULL AND f.id IS NULL;

-- Move to root
UPDATE notes SET folder_id = NULL WHERE folder_id NOT IN (SELECT id FROM folders);
```

### Issue 4: React State Not Updating
**Symptom**: Database has notes but UI doesn't show them
**Cause**: State not refreshing after operations
**Fix**: Ensure `fetchNotes()` is called after:
- Creating a note
- Moving a note
- Deleting a folder

## Quick Test Procedure

1. **Open app** → Go to Notes tab
2. **Create folder** → Click folder+ icon → Name it "Test"
3. **Right-click folder** → Select "New Note in Folder"
4. **Expand folder** → Click chevron next to "Test"
5. **Verify** → Should see "Untitled Note" under "Test" folder

If this works, the feature is functioning correctly.

## Code Verification Checklist

✅ Database schema has `folder_id` column on notes
✅ IPC handler `notes:list` returns all notes
✅ `fetchNotes()` stores all notes in state
✅ `renderFolder()` filters notes by `folder_id`
✅ Notes render when `folder.is_expanded` is true
✅ Context menu creates notes with correct `folder_id`
✅ Root files section handles notes with `folder_id === null`

All code is correct based on review. If issue persists, it's likely:
- Data problem (notes don't have folder_id set)
- Folder not expanded
- Browser cache issue (try hard refresh: Ctrl+Shift+R)

## Manual Data Fix (If Needed)

If you want to manually assign existing notes to folders:

```sql
-- Get folder IDs
SELECT id, name FROM folders;

-- Update note to be in a folder
UPDATE notes 
SET folder_id = 'paste-folder-id-here' 
WHERE id = 'paste-note-id-here';

-- Or move all root notes to a folder
UPDATE notes 
SET folder_id = 'paste-folder-id-here' 
WHERE folder_id IS NULL;
```

## Contact Points for Further Help

If problem persists after these steps:
1. Export database schema: `.schema notes` and `.schema folders`
2. Export sample data: `SELECT * FROM notes LIMIT 5;`
3. Share browser console output with any errors
4. Share screenshot of Notes sidebar showing the issue
