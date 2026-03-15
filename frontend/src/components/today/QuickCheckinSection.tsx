/**
 * Gentle structured inputs: mood and energy, kept secondary to writing.
 */
import { useTheme } from '../../hooks/useTheme'

const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'low', label: 'Low', emoji: '😔' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
]

const ENERGY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface QuickCheckinSectionProps {
  mood?: string
  energy?: string
  onMoodChange: (value: string | undefined) => void
  onEnergyChange: (value: string | undefined) => void
}

export function QuickCheckinSection({
  mood,
  energy,
  onMoodChange,
  onEnergyChange,
}: QuickCheckinSectionProps) {
  const theme = useTheme()

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder}`,
        background: 'transparent',
        padding: 18,
      }}
    >
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: theme.textMuted,
          fontWeight: 600,
        }}
      >
        Add a little context
      </p>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: theme.textMuted }}>
        Optional and light. Use it only if it helps you name the day.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: theme.textSecondary }}>Mood</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = mood === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onMoodChange(isSelected ? undefined : opt.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: `1px solid ${isSelected ? theme.accent : theme.contentCardBorder}`,
                    background: isSelected ? theme.accentLight : 'transparent',
                    color: isSelected ? theme.accent : theme.textSecondary,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {opt.emoji} {opt.label}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: theme.textSecondary }}>Energy</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ENERGY_OPTIONS.map((opt) => {
              const isSelected = energy === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onEnergyChange(isSelected ? undefined : opt.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: `1px solid ${isSelected ? theme.accent : theme.contentCardBorder}`,
                    background: isSelected ? theme.accentLight : 'transparent',
                    color: isSelected ? theme.accent : theme.textSecondary,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
