/**
 * List of extracted signals (health, wealth, etc.) with confidence.
 */
import { useTheme } from '../../hooks/useTheme'
import type { ExtractedSignal } from '../../services/journal'

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

interface ExtractedSignalsListProps {
  signals: ExtractedSignal[]
}

export function ExtractedSignalsList({ signals }: ExtractedSignalsListProps) {
  const theme = useTheme()
  if (signals.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: theme.textMuted,
          fontWeight: 600,
        }}
      >
        What stood out
      </p>
      {signals.map((s) => (
        <div
          key={s.id}
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: theme.hoverBg,
            border: `1px solid ${theme.contentCardBorder}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: theme.accent,
              }}
            >
              {DOMAIN_LABELS[s.domain] || s.domain}
            </span>
            {s.confidence != null && (
              <span
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                }}
              >
                {Math.round(s.confidence * 100)}%
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary }}>
            {s.signal_type.replace(/_/g, ' ')}
          </p>
          {s.source_text && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: theme.textMuted, fontStyle: 'italic' }}>
              "{s.source_text.slice(0, 80)}{s.source_text.length > 80 ? '…' : ''}"
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
