/**
 * Premium header: greeting, date, streak, tagline, Control Room button.
 */
import { Typography } from 'antd'
import dayjs from 'dayjs'
import { useTheme } from '../../hooks/useTheme'
import { OpenDashboardButton } from './OpenDashboardButton'

const { Text } = Typography

interface TodayHeaderProps {
  userName?: string | null
  streakDays: number
}

export function TodayHeader({ userName, streakDays }: TodayHeaderProps) {
  const theme = useTheme()

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = userName?.split(' ')[0] ?? ''

  return (
    <header
      style={{
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: `1px solid ${theme.contentCardBorder}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: theme.textPrimary,
              lineHeight: 1.3,
            }}
          >
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 15,
              color: theme.textMuted,
              fontWeight: 400,
            }}
          >
            {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
          {streakDays > 0 && (
            <div
              style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: 20,
                background: theme.accentLight,
                color: theme.accent,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              🔥 {streakDays} day streak
            </div>
          )}
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              color: theme.textMuted,
              maxWidth: 420,
            }}
          >
            A quiet place to notice your day before the rest of life gets loud.
          </p>
        </div>
        <OpenDashboardButton />
      </div>
    </header>
  )
}
