/**
 * Optional mini daily summary in the AI panel (e.g. entry preview or streak).
 */
import { useTheme } from '../../hooks/useTheme'

interface DailySummaryCardProps {
  streakDays: number
  hasEntry: boolean
  wordCount?: number
}

export function DailySummaryCard({ streakDays, hasEntry, wordCount }: DailySummaryCardProps) {
  const theme = useTheme()

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: theme.hoverBg,
        border: `1px solid ${theme.contentCardBorder}`,
      }}
    >
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
        Today at a glance
      </p>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {hasEntry && (
          <span style={{ fontSize: 13, color: theme.textSecondary }}>
            {wordCount != null && wordCount > 0 ? `${wordCount} words written` : 'Entry saved'}
          </span>
        )}
        {streakDays > 0 && (
          <span style={{ fontSize: 13, color: theme.accent, fontWeight: 500 }}>
            🔥 {streakDays} day streak
          </span>
        )}
        {!hasEntry && streakDays === 0 && (
          <span style={{ fontSize: 13, color: theme.textMuted }}>Nothing written yet</span>
        )}
      </div>
    </div>
  )
}
