import { Card, Tag, Typography, Button } from 'antd'
import {
  RiseOutlined,
  WarningOutlined,
  PieChartOutlined,
  TrophyOutlined,
  BulbOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { Insight } from '../../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface InsightCardProps {
  insight: Insight
  onResolve?: (id: string) => void
  showResolve?: boolean
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  trend: <RiseOutlined />,
  warning: <WarningOutlined />,
  imbalance: <PieChartOutlined />,
  achievement: <TrophyOutlined />,
  prediction: <BulbOutlined />,
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'default',
  medium: 'orange',
  high: 'red',
}

export function InsightCard({ insight, onResolve, showResolve }: InsightCardProps) {
  const icon = TYPE_ICONS[insight.type] ?? <BulbOutlined />
  const severityColor = SEVERITY_COLORS[insight.severity] ?? 'default'

  return (
    <Card
      size="small"
      style={{
        opacity: insight.resolved ? 0.7 : 1,
        borderLeft: `4px solid ${
          insight.severity === 'high' ? '#ef4444' : insight.severity === 'medium' ? '#f97316' : '#22c55e'
        }`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20, color: '#6366f1' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            <Tag color={severityColor}>{insight.type}</Tag>
            {insight.domain && <Tag>{insight.domain}</Tag>}
            {insight.created_at && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(insight.created_at).fromNow()}
              </Typography.Text>
            )}
          </div>
          <Typography.Text>{insight.message}</Typography.Text>
          {showResolve && !insight.resolved && onResolve && (
            <div style={{ marginTop: 8 }}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onResolve(insight.id)}
              >
                Mark resolved
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
