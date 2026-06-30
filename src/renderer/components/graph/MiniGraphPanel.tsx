import React, { useEffect, useRef } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  Simulation
} from 'd3-force'
import { useLinksStore } from '../../stores/useLinksStore'
import { useNotesStore } from '../../stores/useNotesStore'
import { GraphNode, GraphEdge } from '../../types'

interface MiniGraphPanelProps {
  noteId: string
  onExpand?: () => void
}

export const MiniGraphPanel: React.FC<MiniGraphPanelProps> = ({ noteId, onExpand }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simulationRef = useRef<Simulation<GraphNode, GraphEdge> | null>(null)
  const { graphData, fetchGraph, graphRevision } = useLinksStore()
  const { notes, setCurrentNote } = useNotesStore()

  useEffect(() => {
    fetchGraph()
  }, [noteId, graphRevision])

  useEffect(() => {
    if (!graphData.nodes.length || !canvasRef.current) return

    const connectedIds = new Set<string>([noteId])
    graphData.edges.forEach((e) => {
      if (e.source_id === noteId || e.target_id === noteId) {
        connectedIds.add(e.source_id)
        connectedIds.add(e.target_id)
      }
    })

    const nodes: GraphNode[] = graphData.nodes
      .filter((n) => connectedIds.has(n.id))
      .map((n) => ({ ...n, x: undefined, y: undefined }))

    const nodeIds = new Set(nodes.map((n) => n.id))
    const edges: GraphEdge[] = graphData.edges
      .filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))
      .map((e) => ({ ...e, source: e.source_id, target: e.target_id }))

    const canvas = canvasRef.current
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    simulationRef.current?.stop()
    const simulation = forceSimulation<GraphNode, GraphEdge>(nodes)
      .force('charge', forceManyBody().strength(-80))
      .force('link', forceLink<GraphNode, GraphEdge>(edges).id((d) => d.id).distance(50))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(18))

    simulationRef.current = simulation

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      if (canvas.width !== width) {
        canvas.width = width
        canvas.height = height
      }
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.dataset.theme === 'dark'
      edges.forEach((link) => {
        const s = typeof link.source === 'object' ? link.source : nodes.find((n) => n.id === link.source)
        const t = typeof link.target === 'object' ? link.target : nodes.find((n) => n.id === link.target)
        if (!s?.x || !t?.x || s.y == null || t.y == null) return
        ctx.strokeStyle = isDark ? 'rgba(161,161,170,0.4)' : 'rgba(113,113,122,0.5)'
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.stroke()
      })

      nodes.forEach((node) => {
        if (node.x == null || node.y == null) return
        const isCenter = node.id === noteId
        ctx.fillStyle = isCenter ? (isDark ? '#818cf8' : '#4f46e5') : (isDark ? '#52525b' : '#a1a1aa')
        ctx.beginPath()
        ctx.arc(node.x, node.y, isCenter ? 8 : 5, 0, Math.PI * 2)
        ctx.fill()
        if (isCenter) {
          ctx.fillStyle = isDark ? '#fafafa' : '#18181b'
          ctx.font = '600 9px Inter, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(node.title?.slice(0, 14) || 'Note', node.x, node.y - 12)
        }
      })
    }

    simulation.on('tick', draw)
    draw()

    return () => simulation.stop()
  }, [graphData, noteId])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !simulationRef.current) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    for (const node of simulationRef.current.nodes()) {
      if (node.x == null || node.y == null) continue
      const dx = node.x - x
      const dy = node.y - y
      if (Math.sqrt(dx * dx + dy * dy) < 12 && node.type === 'note') {
        const note = notes.find((n) => n.id === node.id)
        if (note) setCurrentNote(note)
        return
      }
    }
  }

  return (
    <div className="mini-graph-panel">
      <div className="mini-graph-panel__header">
        <span>Graph · local neighborhood</span>
        {onExpand && (
          <button type="button" className="btn btn--ghost mini-graph-panel__expand" onClick={onExpand}>
            Expand
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="mini-graph-panel__canvas" onClick={handleClick} />
    </div>
  )
}

export default MiniGraphPanel
