import { Extension } from '@tiptap/core'

export interface SlashCommandOptions {
  onSlashTriggered?: (query: string, range: { from: number; to: number }) => void
  onSlashDismissed?: () => void
}

export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      onSlashTriggered: undefined,
      onSlashDismissed: undefined
    }
  },

  onUpdate() {
    const { editor } = this
    const { selection } = editor.state
    const { $from } = selection
    const textBefore = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 30),
      $from.parentOffset,
      null,
      '\n'
    )

    const match = textBefore.match(/(?:^|\s)\/([^\s]*)$/)
    if (match) {
      const query = match[1]
      const slashIndex = textBefore.lastIndexOf('/')
      const fromPos = $from.pos - (textBefore.length - slashIndex)
      this.options.onSlashTriggered?.(query, { from: fromPos, to: $from.pos })
    } else {
      this.options.onSlashDismissed?.()
    }
  }
})
