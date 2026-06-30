import { ipcMain, dialog } from 'electron'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

function parseIcsEvents(content: string): Array<{
  title: string
  start_at: string
  end_at: string
  all_day: boolean
}> {
  const events: Array<{ title: string; start_at: string; end_at: string; all_day: boolean }> = []
  const blocks = content.split('BEGIN:VEVENT')

  for (const block of blocks.slice(1)) {
    const summary = block.match(/SUMMARY:(.+)/)?.[1]?.trim()
    const dtStart = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/)?.[1]
    const dtEnd = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8}T?\d{0,6}Z?)/)?.[1]
    if (!summary || !dtStart) continue

    const parseIcsDate = (raw: string, isEnd = false) => {
      if (raw.length === 8) {
        const y = raw.slice(0, 4)
        const m = raw.slice(4, 6)
        const d = raw.slice(6, 8)
        const date = new Date(`${y}-${m}-${d}T${isEnd ? '23:59:59' : '00:00:00'}`)
        return date.toISOString()
      }
      const y = raw.slice(0, 4)
      const mo = raw.slice(4, 6)
      const da = raw.slice(6, 8)
      const h = raw.slice(9, 11) || '00'
      const mi = raw.slice(11, 13) || '00'
      return new Date(`${y}-${mo}-${da}T${h}:${mi}:00`).toISOString()
    }

    const allDay = dtStart.length === 8
    events.push({
      title: summary.replace(/\\n/g, ' '),
      start_at: parseIcsDate(dtStart),
      end_at: parseIcsDate(dtEnd || dtStart, true),
      all_day: allDay
    })
  }

  return events
}

export function registerImportIPC(db: Database.Database): void {
  ipcMain.handle('events:importIcs', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import calendar (.ics)',
      filters: [{ name: 'iCalendar', extensions: ['ics'] }],
      properties: ['openFile']
    })

    if (result.canceled || !result.filePaths[0]) {
      return { imported: 0 }
    }

    const content = readFileSync(result.filePaths[0], 'utf-8')
    const parsed = parseIcsEvents(content)
    const insert = db.prepare(`
      INSERT INTO calendar_events (title, start_at, end_at, all_day)
      VALUES (@title, @start_at, @end_at, @all_day)
    `)

    const importMany = db.transaction((items: typeof parsed) => {
      for (const item of items) {
        insert.run({
          title: item.title,
          start_at: item.start_at,
          end_at: item.end_at,
          all_day: item.all_day ? 1 : 0
        })
      }
    })

    importMany(parsed)
    return { imported: parsed.length }
  })
}
