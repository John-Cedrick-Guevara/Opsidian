import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { WikilinkExtension } from './WikilinkExtension'
import { SlashCommandExtension } from './SlashCommandExtension'
import { useNotesStore } from '../../stores/useNotesStore'
import { useTasksStore } from '../../stores/useTasksStore'
import { useLinksStore } from '../../stores/useLinksStore'
import { useUIStore } from '../../stores/useUIStore'
import { Note, Task } from '../../types'
import BacklinksPanel from './BacklinksPanel'
import MiniGraphPanel from '../graph/MiniGraphPanel'
import { Icons } from '../layout/Icons'

type SuggestionItem =
  | { kind: 'note'; item: Note }
  | { kind: 'task'; item: Task }
  | { kind: 'create'; label: string }

const SLASH_COMMANDS = [
  { id: 'h1', label: 'Heading 1', hint: '# ' },
  { id: 'h2', label: 'Heading 2', hint: '##' },
  { id: 'bullet', label: 'Bullet list', hint: '-' },
  { id: 'quote', label: 'Quote', hint: '>' },
  { id: 'task', label: 'Task link', hint: '[[task]]' },
  { id: 'link', label: 'Note link', hint: '[[]]' }
]

export const EditorView: React.FC = () => {
  const { currentNote, updateNote, createNote, notes, setCurrentNote } = useNotesStore()
  const { tasks } = useTasksStore()
  const { createLink, bumpGraphRevision } = useLinksStore()
  const { setView } = useUIStore()
  const [title, setTitle] = useState('')
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorAreaRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionQuery, setSuggestionQuery] = useState('')
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 })
  const [suggestionRange, setSuggestionRange] = useState({ from: 0, to: 0 })
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)

  const [showSlash, setShowSlash] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 })
  const [slashRange, setSlashRange] = useState({ from: 0, to: 0 })
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0)

  const suggestionStateRef = useRef({
    showSuggestions,
    suggestionQuery,
    suggestionRange,
    selectedSuggestionIndex,
    showSlash,
    slashQuery,
    slashRange,
    selectedSlashIndex,
    notes,
    tasks
  })

  useEffect(() => {
    if (currentNote) setTitle(currentNote.title)
  }, [currentNote])

  useEffect(() => {
    suggestionStateRef.current = {
      showSuggestions,
      suggestionQuery,
      suggestionRange,
      selectedSuggestionIndex,
      showSlash,
      slashQuery,
      slashRange,
      selectedSlashIndex,
      notes,
      tasks
    }
  }, [showSuggestions, suggestionQuery, suggestionRange, selectedSuggestionIndex, showSlash, slashQuery, slashRange, selectedSlashIndex, notes, tasks])

  const getSuggestions = useCallback((): SuggestionItem[] => {
    const q = suggestionQuery.toLowerCase()
    const noteMatches = notes
      .filter((n) => n.id !== currentNote?.id && n.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((n) => ({ kind: 'note' as const, item: n }))
    const taskMatches = tasks
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({ kind: 'task' as const, item: t }))
    const items: SuggestionItem[] = [...noteMatches, ...taskMatches]
    if (suggestionQuery.trim()) {
      items.push({ kind: 'create', label: suggestionQuery.trim() })
    }
    return items
  }, [suggestionQuery, notes, tasks, currentNote?.id])

  const checkSuggestions = (ed: ReturnType<typeof useEditor>) => {
    if (!ed) return
    const { selection } = ed.state
    const { $from } = selection
    const textBefore = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 50),
      $from.parentOffset,
      null,
      '\n'
    )
    const match = textBefore.match(/\[\[([^\]|]*)$/)
    if (match) {
      const query = match[1]
      const triggerIndex = textBefore.lastIndexOf('[[')
      const fromPos = $from.pos - (textBefore.length - triggerIndex)
      try {
        const domRect = ed.view.coordsAtPos(fromPos)
        setSuggestionPos({ top: domRect.bottom + 4, left: domRect.left })
      } catch {}
      setSuggestionQuery(query)
      setSuggestionRange({ from: fromPos, to: $from.pos })
      setShowSuggestions(true)
      setSelectedSuggestionIndex(0)
      setShowSlash(false)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertWikilink = async (
    entityType: 'note' | 'task',
    entityId: string,
    label: string
  ) => {
    if (!currentNote || !editorRef.current) return
    const ed = editorRef.current
    await createLink(
      { type: 'note', id: currentNote.id },
      { type: entityType, id: entityId }
    )
    ed
      .chain()
      .focus()
      .insertContentAt(suggestionRange, [
        {
          type: 'wikilink',
          attrs: { entityType, entityId, noteId: entityId, label }
        },
        { type: 'text', text: ' ' }
      ])
      .run()
    bumpGraphRevision()
    setShowSuggestions(false)
  }

  const applySlashCommand = (commandId: string) => {
    const ed = editorRef.current
    if (!ed) return
    ed.chain().focus().deleteRange(slashRange).run()
    switch (commandId) {
      case 'h1':
        ed.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        ed.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'bullet':
        ed.chain().focus().toggleBulletList().run()
        break
      case 'quote':
        ed.chain().focus().toggleBlockquote().run()
        break
      case 'task':
        ed.chain().focus().insertContent('[[').run()
        break
      case 'link':
        ed.chain().focus().insertContent('[[').run()
        break
    }
    setShowSlash(false)
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Type / for commands, [[ to link notes or tasks...'
      }),
      SlashCommandExtension.configure({
        onSlashTriggered: (query, range) => {
          const ed = editorRef.current
          if (!ed) return
          try {
            const domRect = ed.view.coordsAtPos(range.from)
            setSlashPos({ top: domRect.bottom + 4, left: domRect.left })
          } catch {}
          setSlashQuery(query)
          setSlashRange(range)
          setShowSlash(true)
          setSelectedSlashIndex(0)
          setShowSuggestions(false)
        },
        onSlashDismissed: () => setShowSlash(false)
      }),
      WikilinkExtension.configure({
        onWikilinkTriggered: async (targetTitle, range) => {
          if (!currentNote) return
          let targetNote = notes.find(
            (n) => n.title.toLowerCase() === targetTitle.toLowerCase()
          )
          if (!targetNote) targetNote = await createNote(targetTitle)
          await createLink(
            { type: 'note', id: currentNote.id },
            { type: 'note', id: targetNote.id }
          )
          editorRef.current?.commands.insertContentAt(range.from, {
            type: 'wikilink',
            attrs: {
              entityType: 'note',
              entityId: targetNote.id,
              noteId: targetNote.id,
              label: targetNote.title
            }
          })
          bumpGraphRevision()
        }
      })
    ],
    content: currentNote ? JSON.parse(currentNote.body) : {},
    onUpdate: ({ editor: ed }) => {
      if (!currentNote) return
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(async () => {
        await updateNote(currentNote.id, { body: JSON.stringify(ed.getJSON()) })
      }, 200)
      checkSuggestions(ed)
    },
    onSelectionUpdate: ({ editor: ed }) => checkSuggestions(ed),
    editorProps: {
      handleClick: (view, _pos, event) => {
        const target = event.target as HTMLElement
        const linkEl = target.closest('[data-wikilink], .wikilink')
        if (linkEl) {
          const entityType = (linkEl.getAttribute('data-entity-type') || 'note') as 'note' | 'task'
          const entityId = linkEl.getAttribute('data-entity-id') || linkEl.getAttribute('data-note-id')
          if (entityId) {
            if (entityType === 'note') {
              const note = notes.find((n) => n.id === entityId)
              if (note) setCurrentNote(note)
            } else {
              setView('kanban')
            }
            return true
          }
        }
        return false
      },
      handleKeyDown: (_view, event) => {
        const state = suggestionStateRef.current
        if (state.showSuggestions) {
          const items: SuggestionItem[] = []
          const q = state.suggestionQuery.toLowerCase()
          notes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 6).forEach((n) => items.push({ kind: 'note', item: n }))
          tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 4).forEach((t) => items.push({ kind: 'task', item: t }))
          if (state.suggestionQuery.trim()) items.push({ kind: 'create', label: state.suggestionQuery.trim() })

          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedSuggestionIndex((p) => (p + 1) % Math.max(items.length, 1))
            return true
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedSuggestionIndex((p) => (p - 1 + items.length) % Math.max(items.length, 1))
            return true
          }
          if (event.key === 'Enter' && items.length) {
            event.preventDefault()
            const sel = items[state.selectedSuggestionIndex % items.length]
            if (sel.kind === 'note') insertWikilink('note', sel.item.id, sel.item.title)
            else if (sel.kind === 'task') insertWikilink('task', sel.item.id, sel.item.title)
            else createNote(sel.label).then((n) => insertWikilink('note', n.id, n.title))
            return true
          }
          if (event.key === 'Escape') {
            setShowSuggestions(false)
            return true
          }
        }
        if (state.showSlash) {
          const filtered = SLASH_COMMANDS.filter((c) =>
            c.label.toLowerCase().includes(state.slashQuery.toLowerCase())
          )
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setSelectedSlashIndex((p) => (p + 1) % Math.max(filtered.length, 1))
            return true
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setSelectedSlashIndex((p) => (p - 1 + filtered.length) % Math.max(filtered.length, 1))
            return true
          }
          if (event.key === 'Enter' && filtered.length) {
            event.preventDefault()
            applySlashCommand(filtered[state.selectedSlashIndex % filtered.length].id)
            return true
          }
          if (event.key === 'Escape') {
            setShowSlash(false)
            return true
          }
        }
        return false
      }
    }
  }, [currentNote?.id])

  editorRef.current = editor

  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (editor && currentNote) {
      try {
        const content = JSON.parse(currentNote.body)
        if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
          editor.commands.setContent(content, false)
        }
      } catch {
        editor.commands.setContent('', false)
      }
    }
  }, [currentNote?.id, editor])

  if (!currentNote) {
    return (
      <div className="editor-empty-state">
        <Icons.Note style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.5 }} />
        <p>Select or create a note to start writing</p>
        <p className="editor-empty-hint">Markdown shortcuts: **bold**, *italic*, # heading, - list, &gt; quote</p>
      </div>
    )
  }

  const suggestions = getSuggestions()
  const filteredSlash = SLASH_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(slashQuery.toLowerCase())
  )

  return (
    <div className="editor-wrapper">
      <div className="editor-container editor-container--split">
        <input
          type="text"
          className="editor-title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = setTimeout(async () => {
              await updateNote(currentNote.id, { title: e.target.value })
            }, 200)
          }}
          placeholder="Untitled Note"
        />

        <div
          className="editor-main-split"
          ref={editorAreaRef}
          onFocus={() => setToolbarVisible(true)}
          onBlur={(e) => {
            const related = e.relatedTarget as HTMLElement | null
            if (!related || !editorAreaRef.current?.contains(related)) {
              setToolbarVisible(false)
            }
          }}
        >
          <div className="editor-pane">
            {toolbarVisible && (
              <div className="editor-toolbar editor-toolbar--floating">
                <button className={`editor-toolbar-btn ${editor?.isActive('bold') ? 'editor-toolbar-btn--active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
                <button className={`editor-toolbar-btn ${editor?.isActive('italic') ? 'editor-toolbar-btn--active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
                <button className={`editor-toolbar-btn ${editor?.isActive('heading', { level: 2 }) ? 'editor-toolbar-btn--active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H</button>
                <button className="editor-toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => editor?.chain().focus().setColor('var(--accent-text)').run()} style={{ color: 'var(--accent-text)' }}>A</button>
                <span className="editor-toolbar-hint">/ slash · [[ link</span>
              </div>
            )}

            <div className="editor-prose-wrap">
              <EditorContent editor={editor} />
            </div>

            {showSuggestions && (
              <div className="editor-suggestions" style={{ top: suggestionPos.top, left: suggestionPos.left }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`editor-suggestion-item${i === selectedSuggestionIndex ? ' editor-suggestion-item--active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (s.kind === 'note') insertWikilink('note', s.item.id, s.item.title)
                      else if (s.kind === 'task') insertWikilink('task', s.item.id, s.item.title)
                      else createNote(s.label).then((n) => insertWikilink('note', n.id, n.title))
                    }}
                  >
                    {s.kind === 'create' ? (
                      <>Create note “{s.label}”</>
                    ) : (
                      <>
                        <span className="editor-suggestion-type">{s.kind}</span>
                        {s.item.title}
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showSlash && (
              <div className="editor-suggestions" style={{ top: slashPos.top, left: slashPos.left }}>
                {filteredSlash.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    type="button"
                    className={`editor-suggestion-item${i === selectedSlashIndex ? ' editor-suggestion-item--active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      applySlashCommand(cmd.id)
                    }}
                  >
                    <span>{cmd.label}</span>
                    <span className="editor-suggestion-hint">{cmd.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <MiniGraphPanel noteId={currentNote.id} onExpand={() => setView('graph')} />
        </div>
      </div>

      <BacklinksPanel entityId={currentNote.id} entityType="note" />
    </div>
  )
}

export default EditorView
