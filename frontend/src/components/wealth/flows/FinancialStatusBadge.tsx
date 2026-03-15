/**
 * FinancialStatusBadge — consistent status UI for transactions.
 */
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#f59e0b', icon: <ClockCircleOutlined /> },
  processing: { label: 'Processing', color: '#0ea5e9', icon: <SyncOutlined spin /> },
  posted: { label: 'Posted', color: '#22c55e', icon: <CheckCircleOutlined /> },
  failed: { label: 'Failed', color: '#ef4444', icon: <CloseCircleOutlined /> },
  canceled: { label: 'Canceled', color: '#64748b', icon: <CloseCircleOutlined /> },
  reversed: { label: 'Reversed', color: '#64748b', icon: <CloseCircleOutlined /> },
  requires_action: { label: 'Action required', color: '#f59e0b', icon: <ClockCircleOutlined /> },
}

interface FinancialStatusBadgeProps {
  status: string
  size?: 'small' | 'default'
}

export function FinancialStatusBadge({ status, size = 'default' }: FinancialStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: size === 'small' ? '2px 8px' : '4px 10px',
        borderRadius: 8,
        fontSize: size === 'small' ? 11 : 12,
        fontWeight: 500,
        background: `${config.color}18`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
