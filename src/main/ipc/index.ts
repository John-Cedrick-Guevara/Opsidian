import Database from 'better-sqlite3'
import { registerNotesIPC } from './notes'
import { registerTasksIPC } from './tasks'
import { registerLinksIPC } from './links'
import { registerEventsIPC } from './events'
import { registerFoldersIPC } from './folders'
import { registerImportIPC } from './import'

export function registerAllIPC(db: Database.Database): void {
  registerNotesIPC(db)
  registerTasksIPC(db)
  registerLinksIPC(db)
  registerEventsIPC(db)
  registerFoldersIPC(db)
  registerImportIPC(db)
}
