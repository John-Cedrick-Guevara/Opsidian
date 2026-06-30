import { create } from 'zustand'
import { Link, GraphNode, GraphEdge } from '../types'

interface LinksState {
  links: Link[]
  graphData: { nodes: GraphNode[]; edges: GraphEdge[] }
  graphRevision: number
  loading: boolean
  fetchLinksForEntity: (type: string, id: string) => Promise<void>
  fetchGraph: () => Promise<void>
  createLink: (source: { type: string; id: string }, target: { type: string; id: string }) => Promise<Link>
  deleteLink: (id: string) => Promise<void>
  bumpGraphRevision: () => void
}

export const useLinksStore = create<LinksState>((set) => ({
  links: [],
  graphData: { nodes: [], edges: [] },
  graphRevision: 0,
  loading: false,

  fetchLinksForEntity: async (type, id) => {
    set({ loading: true })
    try {
      const list = await window.opsidian.links.getForEntity(type, id)
      set({ links: list })
    } catch (err) {
      console.error('Failed to fetch links for entity:', err)
    } finally {
      set({ loading: false })
    }
  },

  fetchGraph: async () => {
    set({ loading: true })
    try {
      const data = await window.opsidian.links.getGraph()
      set({ graphData: data })
    } catch (err) {
      console.error('Failed to fetch graph data:', err)
    } finally {
      set({ loading: false })
    }
  },

  createLink: async (source, target) => {
    const link = await window.opsidian.links.create(source, target)
    set((state) => ({ graphRevision: state.graphRevision + 1 }))
    return link
  },

  deleteLink: async (id) => {
    try {
      await window.opsidian.links.delete(id)
      set((state) => ({
        links: state.links.filter((l) => l.id !== id),
        graphRevision: state.graphRevision + 1
      }))
    } catch (err) {
      console.error('Failed to delete link:', err)
    }
  },

  bumpGraphRevision: () => set((state) => ({ graphRevision: state.graphRevision + 1 }))
}))
