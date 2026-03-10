import { Card, Progress, Tag } from 'antd'
import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons'
import type { ControlRoomSummary } from '../../types/controlRoom'
import { STATUS_COLORS } from './constants'

interface ControlRoomHeroProps {
  data: ControlRoomSummary
  loading?: boolean
}

export function ControlRoomHero({ data, loading }: ControlRoomHeroProps) {
  const trendIcon =
    data.score_trend_week > 0 ? (
      <RiseOutlined style={{ color: '#22c55e' }} />
    ) : data.score_trend_week < 0 ? (
      <FallOutlined style={{ color: '#ef4444' }} />
    ) : (
      <MinusOutlined style={{ color: '#64748b' }} />
    )

  return (
    <Card
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      styles={{ body: { padding: 32 } }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <Progress
            type="circle"
            percent={Math.round(data.life_score)}
            size={140}
            strokeColor={{
              '0%': STATUS_COLORS[data.status] || '#6366f1',
              '100%': STATUS_COLORS[data.status] || '#8b5cf6',
            }}
            trailColor="#e2e8f0"
            format={(p) => (
              <div style={{ color: '#0f172a', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{p}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Life Score</div>
              </div>
            )}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Tag
              color={STATUS_COLORS[data.status]}
              style={{
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: 12,
                border: 0,
              }}
            >
              {data.status}
            </Tag>
            <span style={{ color: '#64748b', fontSize: 14 }}>
              {trendIcon} {data.score_trend_week > 0 ? '+' : ''}
              {data.score_trend_week} vs last week
            </span>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: 16,
            }}
          >
            {data.summary}
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                Level
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
                {data.total_level}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                Total XP
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
                {data.total_xp.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                Trend (30d)
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: data.score_trend_month >= 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {data.score_trend_month >= 0 ? '+' : ''}
                {data.score_trend_month}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
