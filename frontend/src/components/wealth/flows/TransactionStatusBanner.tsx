/**
 * TransactionStatusBanner — pending, processing, failed alerts.
 */
import { Alert, Typography } from 'antd'
import { ClockCircleOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons'
const { Text } = Typography

type BannerType = 'pending' | 'processing' | 'failed' | 'action_required'

interface TransactionStatusBannerProps {
  type: BannerType
  title: string
  description?: string
  transactionRef?: string
  onRetry?: () => void
}

const TYPE_CONFIG: Record<BannerType, { icon: React.ReactNode; alertType: 'info' | 'warning' | 'error' }> = {
  pending: { icon: <ClockCircleOutlined />, alertType: 'info' },
  processing: { icon: <SyncOutlined spin />, alertType: 'info' },
  failed: { icon: <CloseCircleOutlined />, alertType: 'error' },
  action_required: { icon: <ClockCircleOutlined />, alertType: 'warning' },
}

export function TransactionStatusBanner({ type, title, description, transactionRef, onRetry }: TransactionStatusBannerProps) {
  const config = TYPE_CONFIG[type]

  return (
    <Alert
      type={config.alertType}
      showIcon
      icon={config.icon}
      message={title}
      description={
        <div>
          {description && <Text type="secondary" style={{ display: 'block' }}>{description}</Text>}
          {transactionRef && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              Reference: {transactionRef}
            </Text>
          )}
          {onRetry && type === 'failed' && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                marginTop: 8,
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Try again
            </button>
          )}
        </div>
      }
      style={{ borderRadius: 12 }}
    />
  )
}
