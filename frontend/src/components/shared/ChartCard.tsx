/**
 * ChartCard — Chart wrapper with consistent styling.
 * Part of Life OS design system.
 */
import { Card } from 'antd'

export interface ChartCardProps {
  title?: string
  children: React.ReactNode
  loading?: boolean
  extra?: React.ReactNode
}

export function ChartCard({ title, children, loading, extra }: ChartCardProps) {
  return (
    <Card
      title={title}
      loading={loading}
      extra={extra}
      style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
      styles={{
        header: { color: '#f8fafc', borderBottomColor: 'rgba(148, 163, 184, 0.2)' },
        body: { color: '#f8fafc' },
      }}
    >
      {children}
    </Card>
  )
}
