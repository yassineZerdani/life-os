import { Card, Empty, Button } from 'antd'
import { ApartmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { GraphPreview } from '../../types/controlRoom'

const NODE_TYPE_COLORS: Record<string, string> = {
  person: '#ec4899',
  skill: '#6366f1',
  experience: '#06b6d4',
  goal: '#22c55e',
  achievement: '#eab308',
  place: '#f97316',
  project: '#8b5cf6',
}

interface LifeGraphPreviewProps {
  graph: GraphPreview
  loading?: boolean
}

export function LifeGraphPreview({ graph, loading }: LifeGraphPreviewProps) {
  const navigate = useNavigate()
  const nodes = graph.nodes || []
  const edges = graph.edges || []

  return (
    <Card
      title="Life Graph"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {nodes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No nodes in your life graph yet"
          style={{ color: '#64748b' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {nodes.slice(0, 12).map((n) => (
            <div
              key={n.id}
              onClick={() => navigate('/app/life-graph')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                background: '#f8fafc',
                borderRadius: 8,
                cursor: 'pointer',
                border: `1px solid ${NODE_TYPE_COLORS[n.type] || '#e2e8f0'}`,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: NODE_TYPE_COLORS[n.type] || '#64748b',
                }}
              />
              <span style={{ color: '#0f172a', fontSize: 12 }}>{n.name}</span>
              <span
                style={{
                  fontSize: 10,
                  color: '#64748b',
                  textTransform: 'capitalize',
                }}
              >
                {n.type}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {nodes.length} nodes · {edges.length} connections
        </span>
        <Button
          type="primary"
          size="small"
          ghost
          onClick={() => navigate('/app/life-graph')}
          icon={<ApartmentOutlined />}
        >
          Open full life graph
        </Button>
      </div>
    </Card>
  )
}
