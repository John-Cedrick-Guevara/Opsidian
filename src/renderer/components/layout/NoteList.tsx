import React, { useEffect, useState } from 'react'
import { useNotesStore } from '../../stores/useNotesStore'
import { useFoldersStore } from '../../stores/useFoldersStore'
import { Folder, Note } from '../../types'
import { Icons } from './Icons'

type DragItem = { type: 'note' | 'folder'; id: string }

export const NoteList: React.FC = () => {
  const {
    notes,
    currentNote,
    searchQuery,
    currentFolderId,
    fetchNotes,
    setCurrentNote,
    createNote,
    setSearchQuery,
    searchNotes,
    fetchNotesInFolder,
    updateNote,
    deleteNote
  } = useNotesStore()

  const {
    folders,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleExpanded
  } = useFoldersStore()

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: 'folder' | 'note' | 'root'
    id?: string
  } | null>(null)

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [draggingItem, setDraggingItem] = useState<DragItem | null>(null)

  useEffect(() => {
    const initialize = async () => {
      await fetchFolders()
      await fetchNotes()
    }
    initialize()
  }, [])

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    searchNotes(q)
  }

  const handleNewNote = async () => {
    await createNote('Untitled Note')
  }

  const handleNewFolder = async (parentId: string | null = null) => {
    const folder = await createFolder('New Folder', parentId)
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
  }

  const handleRenameFolder = (folder: Folder) => {
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
    setContextMenu(null)
  }

  const handleRenameNote = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingName(note.title || 'Untitled Note')
    setContextMenu(null)
  }

  const handleDeleteFolder = async (id: string) => {
    if (confirm('Delete this folder? Notes inside will be moved to root.')) {
      await deleteFolder(id)
      setContextMenu(null)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (confirm('Delete this note? This cannot be undone.')) {
      await deleteNote(id)
      setContextMenu(null)
    }
  }

  const handleFolderClick = async (folderId: string) => {
    await fetchNotesInFolder(folderId)
  }

  const handleSaveFolderRename = async () => {
    if (editingFolderId && editingName.trim()) {
      await updateFolder(editingFolderId, { name: editingName.trim() })
    }
    setEditingFolderId(null)
    setEditingName('')
  }

  const handleSaveNoteRename = async () => {
    if (editingNoteId && editingName.trim()) {
      await updateNote(editingNoteId, { title: editingName.trim() })
    }
    setEditingNoteId(null)
    setEditingName('')
  }

  const handleContextMenu = (
    e: React.MouseEvent,
    type: 'folder' | 'note' | 'root',
    id?: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, type, id })
  }

  const isFolderDescendant = (ancestorId: string, folderId: string): boolean => {
    let current = folders.find((f) => f.id === folderId)
    while (current?.parent_id) {
      if (current.parent_id === ancestorId) return true
      current = folders.find((f) => f.id === current!.parent_id)
    }
    return false
  }

  const canDropOnFolder = (item: DragItem, targetFolderId: string): boolean => {
    if (item.type === 'folder') {
      if (item.id === targetFolderId) return false
      if (isFolderDescendant(item.id, targetFolderId)) return false
    }
    return true
  }

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    e.stopPropagation()
    setDraggingItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }

  const handleDragEnd = () => {
    setDraggingItem(null)
    setDragOverTarget(null)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string | null, item?: DragItem) => {
    if (!item) {
      try {
        item = JSON.parse(e.dataTransfer.getData('text/plain')) as DragItem
      } catch {
        return
      }
    }
    const targetKey = targetId ?? '__root__'
    const allowed = targetId === null
      ? true
      : canDropOnFolder(item, targetId)
    if (!allowed) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTarget(targetKey)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTarget(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTarget(null)
    setDraggingItem(null)

    let item: DragItem
    try {
      item = JSON.parse(e.dataTransfer.getData('text/plain')) as DragItem
    } catch {
      return
    }

    if (targetFolderId && !canDropOnFolder(item, targetFolderId)) return

    if (item.type === 'note') {
      await updateNote(item.id, { folder_id: targetFolderId })
    } else {
      await updateFolder(item.id, { parent_id: targetFolderId })
    }
  }

  const buildFolderTree = () => {
    const folderMap = new Map<string, Folder & { children: (Folder & { children: (Folder & { children: Folder[] })[] })[] }>()
    const rootFolders: (Folder & { children: (Folder & { children: Folder[] })[] })[] = []

    folders.forEach((f) => {
      folderMap.set(f.id, { ...f, children: [] })
    })

    folders.forEach((f) => {
      const folder = folderMap.get(f.id)!
      if (f.parent_id && folderMap.has(f.parent_id)) {
        folderMap.get(f.parent_id)!.children.push(folder)
      } else {
        rootFolders.push(folder)
      }
    })

    return rootFolders
  }

  const renderNote = (note: Note, depth: number, nested = true) => {
    const isNoteActive = currentNote?.id === note.id
    const isDragging = draggingItem?.type === 'note' && draggingItem.id === note.id

    return (
      <div
        key={note.id}
        className={`note-list-item ${nested ? 'note-list-item--nested' : 'note-list-item--root'}${isNoteActive ? ' note-list-item--active' : ''}${isDragging ? ' note-list-item--dragging' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 4}px` }}
        draggable={editingNoteId !== note.id}
        onDragStart={(e) => handleDragStart(e, { type: 'note', id: note.id })}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          e.stopPropagation()
          if (editingNoteId !== note.id) setCurrentNote(note)
        }}
        onContextMenu={(e) => handleContextMenu(e, 'note', note.id)}
      >
        <Icons.Note style={{ width: 14, height: 14, marginRight: 6, opacity: 0.6, flexShrink: 0 }} />
        <div className="note-list-item-content">
          {editingNoteId === note.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveNoteRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNoteRename()
                if (e.key === 'Escape') {
                  setEditingNoteId(null)
                  setEditingName('')
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="folder-name-input"
            />
          ) : (
            <div className="note-list-item-title">{note.title || 'Untitled Note'}</div>
          )}
        </div>
      </div>
    )
  }

  const renderFolder = (folder: Folder & { children: any[] }, depth = 0) => {
    const isActive = currentFolderId === folder.id
    const folderNotes = notes.filter((n) => n.folder_id === folder.id)
    const isDragOver = dragOverTarget === folder.id
    const isDragging = draggingItem?.type === 'folder' && draggingItem.id === folder.id

    return (
      <div key={folder.id}>
        <div
          className={`folder-item${isActive ? ' folder-item--active' : ''}${isDragOver ? ' folder-item--drag-over' : ''}${isDragging ? ' folder-item--dragging' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 4}px` }}
          draggable={editingFolderId !== folder.id}
          onDragStart={(e) => handleDragStart(e, { type: 'folder', id: folder.id })}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, folder.id, draggingItem ?? undefined)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
          onClick={(e) => {
            e.stopPropagation()
            handleFolderClick(folder.id)
          }}
          onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
        >
          <span
            className="folder-toggle"
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(folder.id)
            }}
          >
            {(folder.children.length > 0 || folderNotes.length > 0) ? (
              folder.is_expanded ? (
                <Icons.ChevronDown style={{ width: 12, height: 12 }} />
              ) : (
                <Icons.ChevronRight style={{ width: 12, height: 12 }} />
              )
            ) : (
              <span style={{ width: 12, display: 'inline-block' }}></span>
            )}
          </span>
          <Icons.Folder style={{ width: 16, height: 16, marginRight: 6, opacity: 0.7 }} />
          {editingFolderId === folder.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveFolderRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFolderRename()
                if (e.key === 'Escape') {
                  setEditingFolderId(null)
                  setEditingName('')
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="folder-name-input"
            />
          ) : (
            <span className="folder-name">{folder.name}</span>
          )}
          {folderNotes.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono' }}>
              {folderNotes.length}
            </span>
          )}
        </div>
        {folder.is_expanded && (
          <>
            {folderNotes.map((note) => renderNote(note, depth + 1))}
            {folder.children.map((child) => renderFolder(child, depth + 1))}
          </>
        )}
      </div>
    )
  }

  const folderTree = buildFolderTree()
  const rootNotes = notes.filter((n) => n.folder_id === null)

  return (
    <div className="notes-navigator">
      <div className="notes-navigator-header">
        <div className="navigator-title-row">
          <h3>Notes</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn btn-primary btn-icon"
              onClick={() => handleNewFolder(currentFolderId)}
              title="Create new folder"
            >
              <Icons.FolderPlus style={{ width: 16, height: 16 }} />
            </button>
            <button
              className="btn btn-primary btn-icon"
              onClick={handleNewNote}
              title="Create new note (C)"
            >
              <Icons.Plus style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
        <input
          type="text"
          className="notes-search-input"
          placeholder="Search notes... (Cmd+K)"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div
        className={`notes-list${dragOverTarget === '__root__' ? ' notes-list--drag-over' : ''}`}
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) handleContextMenu(e, 'root')
        }}
        onDragOver={(e) => handleDragOver(e, null, draggingItem ?? undefined)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
      >
        {folderTree.map((folder) => renderFolder(folder))}

        {rootNotes.length > 0 && (
          <div className="root-notes-section">
            <div className="root-notes-divider" style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
            <div style={{ padding: '4px 12px', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Root Files
            </div>
            {rootNotes.map((note) => renderNote(note, 0, false))}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'folder' && (
            <>
              <div
                className="context-menu-item"
                onClick={async () => {
                  await createNote('Untitled Note', contextMenu.id!)
                  setContextMenu(null)
                }}
              >
                <Icons.Plus style={{ width: 14, height: 14, marginRight: 6 }} />
                New Note
              </div>
              <div
                className="context-menu-item"
                onClick={() => {
                  handleNewFolder(contextMenu.id!)
                  setContextMenu(null)
                }}
              >
                <Icons.FolderPlus style={{ width: 14, height: 14, marginRight: 6 }} />
                New Folder
              </div>
              <div className="context-menu-divider" />
              <div
                className="context-menu-item"
                onClick={() => {
                  const folder = folders.find((f) => f.id === contextMenu.id)
                  if (folder) handleRenameFolder(folder)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Rename
              </div>
              <div
                className="context-menu-item context-menu-item--danger"
                onClick={() => handleDeleteFolder(contextMenu.id!)}
              >
                <Icons.Trash style={{ width: 14, height: 14, marginRight: 6 }} />
                Delete
              </div>
            </>
          )}
          {contextMenu.type === 'note' && (
            <>
              <div
                className="context-menu-item"
                onClick={() => {
                  const note = notes.find((n) => n.id === contextMenu.id)
                  if (note) handleRenameNote(note)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6 }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Rename
              </div>
              <div
                className="context-menu-item context-menu-item--danger"
                onClick={() => handleDeleteNote(contextMenu.id!)}
              >
                <Icons.Trash style={{ width: 14, height: 14, marginRight: 6 }} />
                Delete
              </div>
            </>
          )}
          {contextMenu.type === 'root' && (
            <>
              <div className="context-menu-item" onClick={async () => {
                await createNote('Untitled Note', null)
                setContextMenu(null)
              }}>
                <Icons.Plus style={{ width: 14, height: 14, marginRight: 6 }} />
                New Note
              </div>
              <div className="context-menu-item" onClick={() => handleNewFolder(null)}>
                <Icons.FolderPlus style={{ width: 14, height: 14, marginRight: 6 }} />
                New Folder
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default NoteList
