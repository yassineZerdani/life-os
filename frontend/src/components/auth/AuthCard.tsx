/**
 * Centered auth card: 20px radius, soft shadow, max-width 420px, comfortable padding.
 */
import { useTheme } from '../../hooks/useTheme'

interface AuthCardProps {
  children: React.ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  const theme = useTheme()

  return (
    <div
      className="auth-card"
      style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 20,
        boxShadow: theme.shadowMd,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg,
        padding: 40,
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {children}
    </div>
  )
}
