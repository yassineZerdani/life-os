/**
 * Tab bar: Sign In | Sign Up with smooth switch.
 */
import { useTheme } from '../../hooks/useTheme'

export type AuthTab = 'signin' | 'signup'

interface AuthTabsProps {
  active: AuthTab
  onChange: (tab: AuthTab) => void
}

export function AuthTabs({ active, onChange }: AuthTabsProps) {
  const theme = useTheme()

  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        marginBottom: 28,
        padding: 4,
        background: theme.hoverBg,
        borderRadius: 12,
      }}
    >
      {(
        [
          { key: 'signin' as const, label: 'Sign In' },
          { key: 'signup' as const, label: 'Sign Up' },
        ] as const
      ).map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            background: active === key ? theme.contentCardBg : 'transparent',
            color: active === key ? theme.textPrimary : theme.textSecondary,
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: active === key ? theme.shadowSm : 'none',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
