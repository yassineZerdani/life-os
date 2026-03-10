import { api } from './api'

export interface GraphNode {
  id: string
  type: string
  name: string
  metadata: Record<string, unknown>
  created_at?: string
}

export interface GraphEdge {
  id: string
  source_id: string
  target_id: string
  relation_type: string
  metadata: Record<string, unknown>
  created_at?: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface NodeWithEdges {
  node: GraphNode
  outgoing_edges: Array<{ id: string; target_id: string; relation_type: string }>
  incoming_edges: Array<{ id: string; source_id: string; relation_type: string }>
  connected_nodes: Array<{ id: string; type: string; name: string }>
}

export const graphService = {
  getGraph: () => api.get<GraphData>('/graph'),

  getNode: (id: string) => api.get<NodeWithEdges>(`/graph/node/${id}`),

  createNode: (data: { type: string; name: string; metadata?: Record<string, unknown> }) =>
    api.post<GraphNode>('/graph/node', data),

  createEdge: (data: {
    source_id: string
    target_id: string
    relation_type: string
    metadata?: Record<string, unknown>
  }) => api.post<GraphEdge>('/graph/edge', data),

  getConnected: (nodeId: string, depth?: number) => {
    const qs = depth != null ? `?depth=${depth}` : ''
    return api.get<Array<{ id: string; type: string; name: string; depth: number }>>(
      `/graph/node/${nodeId}/connected${qs}`
    )
  },

  getPath: (source: string, target: string) =>
    api.get<{ path: string[] }>(`/graph/path?source=${source}&target=${target}`),

  sync: () => api.post<{ status: string; created: number }>('/graph/sync', {}),
}
