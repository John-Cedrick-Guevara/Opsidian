import React, { useEffect, useRef, useState } from 'react'
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
import { useUIStore } from '../../stores/useUIStore'
import { GraphNode, GraphEdge } from '../../types'
import { Icons } from '../layout/Icons'

export const GraphView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { graphData, fetchGraph, graphRevision } = useLinksStore()
  const { notes, setCurrentNote } = useNotesStore()
  const { setView } = useUIStore()

  // Zoom and pan state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const simulationRef = useRef<Simulation<GraphNode, GraphEdge> | null>(null)

  // Drag state
  const isDraggingCanvas = useRef(false)
  const draggedNode = useRef<GraphNode | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const transformStart = useRef({ x: 0, y: 0 })
  const clickStart = useRef({ x: 0, y: 0, time: 0 })
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    node: GraphNode
  } | null>(null)
  const [highlightedNode, setHighlightedNode] = useState<GraphNode | null>(null)
  const [graphFilter, setGraphFilter] = useState<'all' | 'notes' | 'tasks' | 'events' | 'recent'>('all')
  const [hoverTooltip, setHoverTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null)

  useEffect(() => {
    fetchGraph()
    
    const handleClickOutside = () => setContextMenu(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchGraph()
  }, [graphRevision])

  // Setup force simulation
  useEffect(() => {
    if (graphData.nodes.length === 0) return

    let nodes: GraphNode[] = graphData.nodes.map((n) => ({ ...n }))
    if (graphFilter === 'notes') nodes = nodes.filter((n) => n.type === 'note')
    else if (graphFilter === 'tasks') nodes = nodes.filter((n) => n.type === 'task')
    else if (graphFilter === 'events') nodes = nodes.filter((n) => n.type === 'event')
    else if (graphFilter === 'recent') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
      nodes = nodes.filter((n) => new Date(n.updated_at).getTime() >= cutoff)
    }

    const nodeIds = new Set(nodes.map((n) => n.id))
    const edges: GraphEdge[] = graphData.edges
      .filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))
      .map((e) => ({
      ...e,
      source: e.source_id,
      target: e.target_id
    }))

    const canvas = canvasRef.current
    if (!canvas) return
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    // Initialize transform to center the graph
    setTransform({ x: width / 2, y: height / 2, k: 1 })

    const simulation = forceSimulation<GraphNode, GraphEdge>(nodes)
      .force('charge', forceManyBody().strength(-120))
      .force(
        'link',
        forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(90)
      )
      .force('center', forceCenter(0, 0)) // We center relative to our viewport transform
      .force('collision', forceCollide().radius(25))

    simulationRef.current = simulation

    // Keep ticking and redrawing
    simulation.on('tick', () => {
      draw()
    })

    return () => {
      simulation.stop()
    }
  }, [graphData, graphFilter])

  // Get mouse coordinates relative to canvas origin (taking zoom/pan into account)
  const getTransformedMouse = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    return {
      x: (x - transform.x) / transform.k,
      y: (y - transform.y) / transform.k
    }
  };

  // Find node under cursor
  const findNodeAt = (x: number, y: number): GraphNode | null => {
    if (!simulationRef.current) return null
    const nodes = simulationRef.current.nodes()
    for (const node of nodes) {
      const dx = (node.x || 0) - x
      const dy = (node.y || 0) - y
      // Check collision radius (12px hit box)
      if (Math.sqrt(dx * dx + dy * dy) < 14) {
        return node
      }
    }
    return null
  }

  // Draw simulation on canvas
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Handle high DPI screens
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    ctx.clearRect(0, 0, width, height)
    ctx.save()

    // Apply zoom & pan transformations
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.k, transform.k)

    const isDark = document.documentElement.dataset.theme === 'dark'

    // Get connected node IDs if a node is highlighted
    const connectedNodeIds = new Set<string>()
    if (highlightedNode && simulationRef.current) {
      const links = simulationRef.current.force<any>('link')?.links() || []
      for (const link of links) {
        const source = typeof link.source === 'object' ? link.source : null
        const target = typeof link.target === 'object' ? link.target : null
        
        if (source?.id === highlightedNode.id) {
          connectedNodeIds.add(target?.id)
        }
        if (target?.id === highlightedNode.id) {
          connectedNodeIds.add(source?.id)
        }
      }
    }

    // 1. Draw Edges
    if (simulationRef.current) {
      const links = simulationRef.current.force<any>('link')?.links() || []
      for (const link of links) {
        const source = typeof link.source === 'object' ? link.source : null
        const target = typeof link.target === 'object' ? link.target : null
        
        if (
          source && 
          target && 
          typeof source.x === 'number' && 
          typeof source.y === 'number' && 
          typeof target.x === 'number' && 
          typeof target.y === 'number'
        ) {
          // Check if this edge is connected to highlighted node
          const isHighlighted = highlightedNode && 
            (source.id === highlightedNode.id || target.id === highlightedNode.id)
          
          ctx.strokeStyle = isHighlighted 
            ? (isDark ? '#818cf8' : '#4f46e5')
            : (isDark ? 'rgba(161, 161, 170, 0.4)' : 'rgba(113, 113, 122, 0.6)')
          ctx.lineWidth = isHighlighted ? 2 : 1.5
          
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      }
    }

    // 2. Draw Nodes
    if (simulationRef.current) {
      const nodes = simulationRef.current.nodes()
      for (const node of nodes) {
        const nx = node.x || 0
        const ny = node.y || 0

        ctx.save()
        ctx.translate(nx, ny)

        // Check if this node is highlighted or connected
        const isHighlighted = highlightedNode?.id === node.id
        const isConnected = connectedNodeIds.has(node.id)
        const dimmed = highlightedNode && !isHighlighted && !isConnected

        // Set colors based on type
        let fill = 'var(--accent)'
        let shape: 'circle' | 'square' | 'diamond' = 'circle'

        if (node.type === 'note') {
          fill = isDark ? '#818cf8' : '#4f46e5' // Indigo
          shape = 'circle'
        } else if (node.type === 'task') {
          shape = 'square'
          if (node.status === 'done') fill = '#22c55e' // Green
          else if (node.status === 'doing') fill = '#f59e0b' // Amber
          else if (node.status === 'skipped') fill = '#f43f5e' // Rose
          else fill = '#9ca3af' // Todo (Gray)
        } else if (node.type === 'event') {
          fill = '#3b82f6' // Blue
          shape = 'diamond'
        }

        // Apply dimming/highlighting
        ctx.globalAlpha = dimmed ? 0.3 : 1

        ctx.fillStyle = fill
        ctx.strokeStyle = isHighlighted ? fill : (isDark ? '#000000' : '#ffffff')
        ctx.lineWidth = isHighlighted ? 2.5 : 1.5

        // Render specific shape with size boost for highlighted
        const size = isHighlighted ? 9 : 7
        
        if (shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, size, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        } else if (shape === 'square') {
          const s = size - 1
          ctx.beginPath()
          ctx.rect(-s, -s, s * 2, s * 2)
          ctx.fill()
          ctx.stroke()
        } else if (shape === 'diamond') {
          const s = size + 1
          ctx.beginPath()
          ctx.moveTo(0, -s)
          ctx.lineTo(s, 0)
          ctx.lineTo(0, s)
          ctx.lineTo(-s, 0)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }

        // Render text label
        const isHovered = hoveredNode?.id === node.id
        ctx.fillStyle = (isHovered || isHighlighted)
          ? (isDark ? '#fafafa' : '#18181b')
          : (isDark ? '#a1a1aa' : '#52525b')
        ctx.font = (isHovered || isHighlighted)
          ? '600 11px Inter, sans-serif'
          : '400 10px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.title || 'Untitled', 0, 16)

        ctx.restore()
      }
    }

    ctx.restore()
  }

  // Draw once zoom/pan states are updated
  useEffect(() => {
    draw()
  }, [transform, hoveredNode, highlightedNode])

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomFactor = 1.1
    const nextK = e.deltaY < 0 ? transform.k * zoomFactor : transform.k / zoomFactor
    
    // Constraint zoom range between 0.15x and 4x
    const k = Math.max(0.15, Math.min(4, nextK))

    // Zoom centered on cursor
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const x = mouseX - (mouseX - transform.x) * (k / transform.k)
    const y = mouseY - (mouseY - transform.y) * (k / transform.k)

    setTransform({ x, y, k })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouse = getTransformedMouse(e.clientX, e.clientY)
    const node = findNodeAt(mouse.x, mouse.y)

    // Record click start position and time
    clickStart.current = { x: e.clientX, y: e.clientY, time: Date.now() }

    if (node) {
      // Start node drag
      draggedNode.current = node
      node.fx = node.x
      node.fy = node.y
      // Highlight this node and its connections
      setHighlightedNode(node)
      // Keep simulation running during drag
      simulationRef.current?.alphaTarget(0.3).restart()
    } else {
      // Start canvas pan drag
      isDraggingCanvas.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      transformStart.current = { x: transform.x, y: transform.y }
      setHighlightedNode(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouse = getTransformedMouse(e.clientX, e.clientY)
    const node = findNodeAt(mouse.x, mouse.y)
    setHoveredNode(node)
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setHoverTooltip({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12, node })
    } else {
      setHoverTooltip(null)
    }

    if (draggedNode.current) {
      // Update dragged node position
      draggedNode.current.fx = mouse.x
      draggedNode.current.fy = mouse.y
      draw()
    } else if (isDraggingCanvas.current) {
      // Update canvas pan position
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setTransform({
        ...transform,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode.current) {
      // Release node pinning
      draggedNode.current.fx = null
      draggedNode.current.fy = null
      draggedNode.current = null
      simulationRef.current?.alphaTarget(0)
    }
    isDraggingCanvas.current = false
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const dx = Math.abs(e.clientX - clickStart.current.x)
    const dy = Math.abs(e.clientY - clickStart.current.y)
    const wasDrag = dx > 5 || dy > 5

    if (wasDrag) return

    const mouse = getTransformedMouse(e.clientX, e.clientY)
    const node = findNodeAt(mouse.x, mouse.y)

    // Only clear highlight when clicking empty canvas; node clicks are handled in mousedown
    if (!node) {
      setHighlightedNode(null)
    }
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mouse = getTransformedMouse(e.clientX, e.clientY)
    const node = findNodeAt(mouse.x, mouse.y)

    if (node) {
      // Handle node double-click navigation
      if (node.type === 'note') {
        const fullNote = notes.find((n) => n.id === node.id)
        if (fullNote) {
          setCurrentNote(fullNote)
          setView('notes')
        }
      } else if (node.type === 'task') {
        setView('kanban')
      } else if (node.type === 'event') {
        setView('calendar')
      }
    }
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const mouse = getTransformedMouse(e.clientX, e.clientY)
    const node = findNodeAt(mouse.x, mouse.y)

    if (node) {
      setContextMenu({ x: e.clientX, y: e.clientY, node })
      setHighlightedNode(node)
    }
  }

  const handleOpenNode = () => {
    if (!contextMenu) return
    
    const node = contextMenu.node
    if (node.type === 'note') {
      const fullNote = notes.find((n) => n.id === node.id)
      if (fullNote) {
        setCurrentNote(fullNote)
        setView('notes')
      }
    } else if (node.type === 'task') {
      setView('kanban')
    } else if (node.type === 'event') {
      setView('calendar')
    }
    setContextMenu(null)
  }

  const resetZoom = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setTransform({
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2,
      k: 1
    })
  }

  return (
    <div className="graph-container">
      <canvas
        ref={canvasRef}
        className="graph-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={handleContextMenu}
      />

      <div className="graph-toolbar">
        <span className="graph-stats">
          {graphData.nodes.length} nodes · {graphData.edges.length} edges
        </span>
        <select
          className="graph-filter-select"
          value={graphFilter}
          onChange={(e) => setGraphFilter(e.target.value as typeof graphFilter)}
        >
          <option value="all">All</option>
          <option value="notes">Notes</option>
          <option value="tasks">Tasks</option>
          <option value="events">Events</option>
          <option value="recent">Recent (7d)</option>
        </select>
        <button className="btn" onClick={resetZoom} title="Center Graph">
          <Icons.Menu style={{ width: 14, height: 14 }} />
          <span>Center</span>
        </button>
        <button className="btn" onClick={() => fetchGraph()} title="Refresh Graph Data">
          <Icons.Recurring style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {hoverTooltip && (
        <div
          className="graph-hover-tooltip"
          style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
        >
          <strong>{hoverTooltip.node.title}</strong>
          <span>{hoverTooltip.node.type}</span>
          {hoverTooltip.node.status && <span>{hoverTooltip.node.status}</span>}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={handleOpenNode}>
            <Icons.Note style={{ width: 14, height: 14, marginRight: 6 }} />
            Open {contextMenu.node.type}
          </div>
          <div className="context-menu-divider" />
          <div 
            className="context-menu-item" 
            onClick={() => {
              setHighlightedNode(null)
              setContextMenu(null)
            }}
          >
            Clear highlight
          </div>
        </div>
      )}
    </div>
  )
}
export default GraphView
