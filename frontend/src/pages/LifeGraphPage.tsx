import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, Select, Spin, Empty, Drawer, Typography, Button } from 'antd'
import { graphService } from '../services/graph'
import type { GraphNode, GraphEdge } from '../services/graph'

const NODE_TYPE_COLORS: Record<string, string> = {
  person: '#3b82f6',
  skill: '#22c55e',
  experience: '#8b5cf6',
  goal: '#f97316',
  achievement: '#eab308',
  place: '#06b6d4',
  project: '#ec4899',
}

const DEFAULT_COLOR = '#94a3b8'

function layoutNodes(nodes: GraphNode[], _edges: GraphEdge[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const radius = 250
  const centerX = 400
  const centerY = 300

  if (nodes.length === 0) return {}
  if (nodes.length === 1) {
    positions[nodes[0].id] = { x: centerX - 50, y: centerY - 25 }
    return positions
  }

  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
    positions[n.id] = {
      x: centerX + radius * Math.cos(angle) - 60,
      y: centerY + radius * Math.sin(angle) - 25,
    }
  })
  return positions
}

function buildFlowNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  typeFilter: string | null
): Node[] {
  const pos = layoutNodes(nodes, edges)
  const filtered = typeFilter
    ? nodes.filter((n) => n.type === typeFilter)
    : nodes
  const nodeIds = new Set(filtered.map((n) => n.id))
  const edgeIds = new Set(
    edges
      .filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))
      .flatMap((e) => [e.source_id, e.target_id])
  )
  const visibleIds = new Set([...nodeIds, ...edgeIds])
  const visible = nodes.filter((n) => visibleIds.has(n.id))

  return visible.map((n) => ({
    id: n.id,
    type: 'default',
    position: pos[n.id] || { x: 0, y: 0 },
    data: {
      label: n.name,
      nodeType: n.type,
    },
    style: {
      background: NODE_TYPE_COLORS[n.type] || DEFAULT_COLOR,
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    },
  }))
}

function buildFlowEdges(
  edges: GraphEdge[],
  nodeIds: Set<string>
): Edge[] {
  return edges
    .filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))
    .map((e) => ({
      id: e.id,
      source: e.source_id,
      target: e.target_id,
      label: e.relation_type,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#94a3b8' },
      labelStyle: { fontSize: 10 },
      labelBgStyle: { fill: '#f8fafc' },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }))
}

export function LifeGraphPage() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const queryClient = useQueryClient()
  const runSync = useMutation({
    mutationFn: graphService.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['graph'],
    queryFn: graphService.getGraph,
  })

  const { data: nodeDetails } = useQuery({
    queryKey: ['graph', 'node', selectedNode?.id],
    queryFn: () => graphService.getNode(selectedNode!.id),
    enabled: !!selectedNode?.id,
  })

  const flowNodes = useMemo(() => {
    if (!data) return { nodes: [] as Node[], edges: [] as Edge[] }
    const nodes = buildFlowNodes(data.nodes, data.edges, typeFilter)
    const nodeIds = new Set(nodes.map((n) => n.id))
    const edges = buildFlowEdges(data.edges, nodeIds)
    return { nodes, edges }
  }, [data, typeFilter])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowNodes.edges)

  useEffect(() => {
    setNodes(flowNodes.nodes)
    setEdges(flowNodes.edges)
  }, [flowNodes.nodes, flowNodes.edges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const g = data?.nodes.find((n) => n.id === node.id)
      if (g) {
        setSelectedNode(g)
        setDrawerOpen(true)
      }
    },
    [data]
  )

  const nodeTypes = useMemo(() => {
    const types = new Set(data?.nodes.map((n) => n.type) || [])
    return Array.from(types).sort()
  }, [data])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data || (data.nodes.length === 0 && data.edges.length === 0)) {
    return (
      <div>
        <h1 style={{ marginBottom: 8, fontSize: 28 }}>Life Graph</h1>
        <p style={{ marginBottom: 24, color: '#64748b' }}>
          Your life as a network of people, experiences, and achievements. Add relationships,
          experiences, and achievements to build your graph. Or sync existing data.
        </p>
        <Card>
          <Empty
            description="No graph data yet. Add relationships, experiences, or achievements to see your life graph."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              loading={runSync.isPending}
              onClick={() => runSync.mutate()}
            >
              Sync from existing data
            </Button>
          </Empty>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28 }}>Life Graph</h1>
      <p style={{ marginBottom: 24, color: '#64748b' }}>
        Your life as a network of people, experiences, and achievements. Click nodes to see
        details.
      </p>

      <div style={{ height: 600, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(n) => NODE_TYPE_COLORS[(n.data as { nodeType?: string }).nodeType || ''] || DEFAULT_COLOR}
          />
          <Panel position="top-left">
            <Select
              placeholder="Filter by type"
              allowClear
              style={{ width: 160 }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: null, label: 'All types' },
                ...nodeTypes.map((t) => ({ value: t, label: t })),
              ]}
            />
          </Panel>
        </ReactFlow>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: color,
              }}
            />
            <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>

      <Drawer
        title={selectedNode?.name}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={360}
      >
        {selectedNode && (
          <div>
            <Typography.Text type="secondary" style={{ textTransform: 'capitalize' }}>
              {selectedNode.type}
            </Typography.Text>
            {nodeDetails && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>Connections</Typography.Title>
                {nodeDetails.connected_nodes.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No connections</p>
                ) : (
                  <ul style={{ paddingLeft: 20 }}>
                    {nodeDetails.connected_nodes.map((n) => (
                      <li key={n.id}>
                        <span style={{ textTransform: 'capitalize' }}>{n.type}</span>: {n.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
