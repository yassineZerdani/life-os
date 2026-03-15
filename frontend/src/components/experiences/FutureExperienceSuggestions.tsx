/**
 * FutureExperienceSuggestions — ideas for new types of experiences.
 */
import { Card, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'

const { Text } = Typography

export interface FutureExperienceSuggestionsProps {
  suggestions: string[]
  loading?: boolean
}

export function FutureExperienceSuggestions({ suggestions, loading }: FutureExperienceSuggestionsProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary">Loading…</Text>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600, fontSize: 14 }}>Future experiences</span>}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
        Ideas based on what you’ve logged so far.
      </Text>
      <ul style={{ margin: 0, paddingLeft: 20, color: theme.textSecondary, fontSize: 13 }}>
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </Card>
  )
}
