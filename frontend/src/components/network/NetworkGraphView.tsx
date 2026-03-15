/**
 * NetworkGraphView — nodes (you, contacts, opportunities) and edges. SVG-based.
 */
import { useMemo } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { GraphNode, GraphEdge } from '../../services/network'

export interface NetworkGraphViewProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width?: number
  height?: number
  onNodeClick?: (id: string) => void
}

const NODE_R = 24
const CENTER_X = 200
const CENTER_Y = 200
const RADIUS = 140

export function NetworkGraphView({
  nodes,
  edges,
  width = 400,
  height = 400,
  onNodeClick,
}: NetworkGraphViewProps) {
  const theme = useTheme()

  const { nodePositions, bounds } = useMemo(() => {
    const userNode = nodes.find((n) => n.category === 'user')
    const contactNodes = nodes.filter((n) => n.category !== 'user' && n.category !== 'opportunity')
    const opportunityNodes = nodes.filter((n) => n.category === 'opportunity')
    const pos: Record<string, { x: number; y: number }> = {}
    if (userNode) pos[userNode.id] = { x: CENTER_X, y: CENTER_Y }
    contactNodes.forEach((n, i) => {
      const angle = (i / Math.max(1, contactNodes.length)) * 2 * Math.PI - Math.PI / 2
      pos[n.id] = {
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
      }
    })
    opportunityNodes.forEach((n, i) => {
      const angle = (i / Math.max(1, opportunityNodes.length)) * 2 * Math.PI - Math.PI / 2 + 0.3
      const r = RADIUS + 60
      pos[n.id] = {
        x: CENTER_X + r * Math.cos(angle),
        y: CENTER_Y + r * Math.sin(angle),
      }
    })
    const allX = Object.values(pos).map((p) => p.x)
    const allY = Object.values(pos).map((p) => p.y)
    const minX = Math.min(...allX, 0)
    const maxX = Math.max(...allX, width)
    const minY = Math.min(...allY, 0)
    const maxY = Math.max(...allY, height)
    return { nodePositions: pos, bounds: { minX, maxX, minY, maxY } }
  }, [nodes, width, height])

  const colorFor = (node: GraphNode) => {
    if (node.category === 'user') return theme.textSecondary ?? '#64748b'
    if (node.is_dormant) return '#f59e0b'
    if (node.category === 'opportunity') return '#22c55e'
    return DOMAIN_COLORS.network
  }

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', background: theme.contentCardBg ?? 'transparent' }}
      viewBox={`${bounds.minX - 40} ${bounds.minY - 40} ${bounds.maxX - bounds.minX + 80} ${bounds.maxY - bounds.minY + 80}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {edges.map((e) => {
        const src = nodePositions[e.source]
        const tgt = nodePositions[e.target]
        if (!src || !tgt) return null
        return (
          <line
            key={`${e.source}-${e.target}`}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke={theme.border ?? '#e2e8f0'}
            strokeWidth={1.5}
            strokeOpacity={0.8}
          />
        )
      })}
      {/* Nodes */}
      {nodes.map((node) => {
        const p = nodePositions[node.id]
        if (!p) return null
        const fill = colorFor(node)
        const isUser = node.category === 'user'
        return (
          <g
            key={node.id}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            onClick={() => onNodeClick?.(node.id)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={isUser ? NODE_R + 4 : NODE_R}
              fill={fill}
              fillOpacity={isUser ? 0.3 : 0.15}
              stroke={fill}
              strokeWidth={isUser ? 3 : 2}
            />
            <text
              x={p.x}
              y={p.y + (node.category === 'opportunity' ? NODE_R + 14 : NODE_R + 12)}
              textAnchor="middle"
              fontSize={node.category === 'opportunity' ? 9 : 11}
              fill={theme.textSecondary ?? '#64748b'}
            >
              {node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
