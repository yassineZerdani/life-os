/**
 * Single suggested domain update: soft confirm / dismiss actions.
 */
import { Button } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import type { SuggestedDomainUpdate } from '../../services/journal'

const DOMAIN_LABELS: Record<string, string> = {
  health: 'Health',
  wealth: 'Wealth',
  skills: 'Skills',
  relationships: 'Relationships',
  career: 'Career',
  network: 'Network',
  experiences: 'Experiences',
  identity: 'Identity',
}

interface SuggestedUpdatesCardProps {
  suggestion: SuggestedDomainUpdate
  onConfirm: (id: string) => void
  onReject: (id: string) => void
  isConfirming?: boolean
}

export function SuggestedUpdatesCard({
  suggestion,
  onConfirm,
  onReject,
  isConfirming,
}: SuggestedUpdatesCardProps) {
  const theme = useTheme()
  const confPct = suggestion.confidence != null ? Math.round(suggestion.confidence * 100) : null

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: theme.hoverBg,
        border: `1px solid ${theme.contentCardBorder}`,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 8,
            background: theme.accentLight,
            color: theme.accent,
          }}
        >
          {DOMAIN_LABELS[suggestion.domain] || suggestion.domain}
        </span>
        {confPct != null && (
          <span
            style={{
              fontSize: 11,
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            {confPct}% confidence
          </span>
        )}
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: theme.textPrimary, fontWeight: 500 }}>
        {suggestion.update_type.replace(/_/g, ' ')}
      </p>
      {suggestion.payload_json && Object.keys(suggestion.payload_json).length > 0 && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: theme.textMuted }}>
          {JSON.stringify(suggestion.payload_json)}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onConfirm(suggestion.id)}
          loading={isConfirming}
          style={{
            color: theme.accent,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Keep
        </Button>
        <Button
          type="text"
          size="small"
          danger
          icon={<CloseOutlined />}
          onClick={() => onReject(suggestion.id)}
          disabled={isConfirming}
          style={{ borderRadius: 8, fontWeight: 500 }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  )
}
