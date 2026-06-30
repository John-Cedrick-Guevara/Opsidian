import { Node, mergeAttributes, InputRule } from '@tiptap/core'

export interface WikilinkOptions {
  HTMLAttributes: Record<string, any>
  onWikilinkTriggered?: (title: string, range: { from: number; to: number }) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikilink: {
      setWikilink: (attributes: { entityType: 'note' | 'task'; entityId: string; label: string }) => ReturnType
    }
  }
}

export const WikilinkExtension = Node.create<WikilinkOptions>({
  name: 'wikilink',
  inline: true,
  group: 'inline',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'wikilink',
        'data-wikilink': ''
      }
    }
  },

  addAttributes() {
    return {
      entityType: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-entity-type') || 'note',
        renderHTML: (attributes) => ({
          'data-entity-type': attributes.entityType
        })
      },
      entityId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-entity-id'),
        renderHTML: (attributes) => ({
          'data-entity-id': attributes.entityId
        })
      },
      noteId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-note-id'),
        renderHTML: (attributes) => ({
          'data-note-id': attributes.entityId || attributes.noteId
        })
      },
      label: {
        default: '',
        parseHTML: (element) => element.textContent || '',
        renderHTML: (attributes) => ({
          'data-label': attributes.label
        })
      }
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-wikilink]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const entityId = node.attrs.entityId || node.attrs.noteId
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-entity-id': entityId,
        'data-note-id': entityId,
        role: 'link',
        tabindex: '0'
      }),
      node.attrs.label
    ]
  },

  addCommands() {
    return {
      setWikilink:
        (attributes) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: {
                entityType: attributes.entityType,
                entityId: attributes.entityId,
                noteId: attributes.entityId,
                label: attributes.label
              }
            })
            .run()
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/,
        handler: ({ state, range, match }) => {
          const { tr } = state
          const title = match[1].trim()
          if (!title) return
          tr.delete(range.from, range.to)
          const pos = range.from
          this.options.onWikilinkTriggered?.(title, { from: pos, to: pos })
        }
      })
    ]
  }
})
