/**
 * Single quick-checkin row (e.g. mood or energy). Used by QuickCheckinSection.
 * Export for reuse if needed elsewhere.
 */
import { useTheme } from '../../hooks/useTheme'

export interface QuickCheckinOption {
  value: string
  label: string
  emoji?: string
}

interface QuickCheckinCardProps {
  label: string
  options: QuickCheckinOption[]
  value?: string
  onChange: (value: string | undefined) => void
}

export function QuickCheckinCard({ label, options, value, onChange }: QuickCheckinCardProps) {
  const theme = useTheme()

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: theme.textSecondary }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isSelected ? undefined : opt.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: `1px solid ${isSelected ? theme.accent : theme.contentCardBorder}`,
                background: isSelected ? theme.accentLight : theme.contentCardBg,
                color: isSelected ? theme.accent : theme.textSecondary,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {opt.emoji && `${opt.emoji} `}{opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
