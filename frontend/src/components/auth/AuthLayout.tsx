/**
 * Full-screen split layout for auth: left illustration, right form.
 * Desktop: 55% / 45%. Mobile: stack, form first.
 */
import { useTheme } from '../../hooks/useTheme'

interface AuthLayoutProps {
  illustration: React.ReactNode
  children: React.ReactNode
}

export function AuthLayout({ illustration, children }: AuthLayoutProps) {
  const theme = useTheme()

  return (
    <div
      className="auth-layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        background: theme.contentBg,
      }}
    >
      <aside
        className="auth-layout__illustration"
        style={{
          width: '55%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        {illustration}
      </aside>
      <main
        className="auth-layout__main"
        style={{
          width: '45%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        {children}
      </main>
    </div>
  )
}
