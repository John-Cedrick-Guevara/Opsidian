import { contextBridge, ipcRenderer } from 'electron'

// Type-safe API exposed to the renderer
const api = {
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    create: (data: any) => ipcRenderer.invoke('notes:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('notes:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    search: (query: string) => ipcRenderer.invoke('notes:search', query),
  },
  folders: {
    list: () => ipcRenderer.invoke('folders:list'),
    get: (id: string) => ipcRenderer.invoke('folders:get', id),
    create: (data: any) => ipcRenderer.invoke('folders:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('folders:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('folders:delete', id),
    getNotes: (folderId: string | null) => ipcRenderer.invoke('folders:getNotes', folderId),
  },
  tasks: {
    list: (filter?: any) => ipcRenderer.invoke('tasks:list', filter),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    create: (data: any) => ipcRenderer.invoke('tasks:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('tasks:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
    reorder: (id: string, position: number, status?: string) =>
      ipcRenderer.invoke('tasks:reorder', id, position, status),
    complete: (id: string, targetStatus?: 'done' | 'skipped') =>
      ipcRenderer.invoke('tasks:complete', id, targetStatus),
  },
  links: {
    create: (source: { type: string; id: string }, target: { type: string; id: string }) =>
      ipcRenderer.invoke('links:create', source, target),
    delete: (id: string) => ipcRenderer.invoke('links:delete', id),
    getForEntity: (type: string, id: string) =>
      ipcRenderer.invoke('links:getForEntity', type, id),
    getGraph: () => ipcRenderer.invoke('links:getGraph'),
  },
  events: {
    list: (start: string, end: string) => ipcRenderer.invoke('events:list', start, end),
    get: (id: string) => ipcRenderer.invoke('events:get', id),
    create: (data: any) => ipcRenderer.invoke('events:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('events:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('events:delete', id),
    importIcs: () => ipcRenderer.invoke('events:importIcs'),
  },
}

contextBridge.exposeInMainWorld('opsidian', api)
