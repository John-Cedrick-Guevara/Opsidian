"use strict";
const electron = require("electron");
const api = {
  notes: {
    list: () => electron.ipcRenderer.invoke("notes:list"),
    get: (id) => electron.ipcRenderer.invoke("notes:get", id),
    create: (data) => electron.ipcRenderer.invoke("notes:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("notes:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("notes:delete", id),
    search: (query) => electron.ipcRenderer.invoke("notes:search", query)
  },
  folders: {
    list: () => electron.ipcRenderer.invoke("folders:list"),
    get: (id) => electron.ipcRenderer.invoke("folders:get", id),
    create: (data) => electron.ipcRenderer.invoke("folders:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("folders:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("folders:delete", id),
    getNotes: (folderId) => electron.ipcRenderer.invoke("folders:getNotes", folderId)
  },
  tasks: {
    list: (filter) => electron.ipcRenderer.invoke("tasks:list", filter),
    get: (id) => electron.ipcRenderer.invoke("tasks:get", id),
    create: (data) => electron.ipcRenderer.invoke("tasks:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("tasks:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("tasks:delete", id),
    reorder: (id, position, status) => electron.ipcRenderer.invoke("tasks:reorder", id, position, status),
    complete: (id, targetStatus) => electron.ipcRenderer.invoke("tasks:complete", id, targetStatus)
  },
  links: {
    create: (source, target) => electron.ipcRenderer.invoke("links:create", source, target),
    delete: (id) => electron.ipcRenderer.invoke("links:delete", id),
    getForEntity: (type, id) => electron.ipcRenderer.invoke("links:getForEntity", type, id),
    getGraph: () => electron.ipcRenderer.invoke("links:getGraph")
  },
  events: {
    list: (start, end) => electron.ipcRenderer.invoke("events:list", start, end),
    get: (id) => electron.ipcRenderer.invoke("events:get", id),
    create: (data) => electron.ipcRenderer.invoke("events:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("events:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("events:delete", id),
    importIcs: () => electron.ipcRenderer.invoke("events:importIcs")
  }
};
electron.contextBridge.exposeInMainWorld("opsidian", api);
