import React from 'react'

const GraphMock = () => {
  const nodes = [
    { id: 'a', x: 80,  y: 80,  r: 8,  label: 'Q3 Planning', accent: true,  anim: 'a' },
    { id: 'b', x: 180, y: 60,  r: 6,  label: 'Sync arch',    accent: false, anim: 'b' },
    { id: 'c', x: 280, y: 90,  r: 7,  label: 'Graph view',   accent: false, anim: 'c' },
    { id: 'd', x: 130, y: 160, r: 5,  label: 'Maya Chen',    accent: false, anim: 'a' },
    { id: 'e', x: 230, y: 180, r: 6,  label: 'Weekly rev',   accent: false, anim: 'b' },
    { id: 'f', x: 330, y: 200, r: 5,  label: 'v0.5',         accent: false, anim: 'c' },
    { id: 'g', x: 60,  y: 220, r: 4,  label: '',             accent: false, anim: 'a' },
    { id: 'h', x: 320, y: 40,  r: 4,  label: '',             accent: false, anim: 'b' },
    { id: 'i', x: 180, y: 250, r: 5,  label: 'Automerge',    accent: false, anim: 'c' },
    { id: 'j', x: 280, y: 260, r: 4,  label: '',             accent: false, anim: 'a' },
  ]
  const edges = [
    ['a','b'], ['a','c'], ['a','d'], ['b','c'], ['b','e'],
    ['c','f'], ['d','e'], ['e','f'], ['e','i'], ['c','h'],
    ['a','g'], ['e','j'], ['b','i'],
  ]
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {edges.map(([from, to], i) => {
        const f = nodeMap[from], t = nodeMap[to]
        const isActive = from === 'a' || to === 'a'
        return (
          <line
            key={`e-${i}`}
            x1={f.x} y1={f.y} x2={t.x} y2={t.y}
            className={`graph-edge${isActive ? ' graph-edge--active' : ''}`}
          />
        )
      })}
      <circle
        cx={nodeMap.a.x} cy={nodeMap.a.y} r={12}
        fill="url(#pulse-grad)"
        className="graph-pulse-ring"
        style={{ '--r': '12px' }}
      />
      {nodes.map(n => (
        <g key={n.id} className={`graph-node-group graph-node-group--${n.anim}`} style={{ animationDelay: `${(parseInt(n.id, 36) % 5) * 0.4}s` }}>
          <circle
            cx={n.x} cy={n.y} r={n.r}
            className={`graph-node${n.accent ? ' graph-node--accent' : ' graph-node--muted'}`}
          />
          {n.label && (
            <text
              x={n.x} y={n.y - n.r - 6}
              textAnchor="middle"
              className={`graph-label${n.accent ? ' graph-label--accent' : ''}`}
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

export default GraphMock
