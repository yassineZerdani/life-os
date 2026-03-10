/**
 * MetricTile — Single metric display for dashboards.
 * Part of Life OS design system.
 */
import { Typography } from 'antd'

const { Text } = Typography

export interface MetricTileProps {
  label: string
  value: string | number
  trend?: number
  suffix?: string
  color?: string
}

export function MetricTile({ label, value, trend, suffix = '', color }: MetricTileProps) {
  return (
    <div
      style={{
        padding: 16,
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.15)',
      }}
    >
      <Text style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: color || '#f8fafc' }}>
          {value}
          {suffix}
        </span>
        {trend !== undefined && (
          <span
            style={{
              fontSize: 12,
              color: trend >= 0 ? '#22c55e' : '#ef4444',
              fontWeight: 600,
            }}
          >
            {trend >= 0 ? '+' : ''}
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
