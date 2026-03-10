/**
 * Left panel: gradient, abstract illustration, headline, supporting text, branding.
 * Feels: intelligent, self-improvement, calm control, futuristic.
 */
import { RocketOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'

export function AuthIllustrationPanel() {
  const theme = useTheme()
  const isDark = theme.contentBg === '#020617' || theme.contentBg?.startsWith('#0')

  return (
    <div
      className="auth-illustration"
      style={{
        width: '100%',
        maxWidth: 520,
        position: 'relative',
      }}
    >
      {/* Soft gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
          borderRadius: 24,
          pointerEvents: 'none',
        }}
      />

      {/* Abstract illustration: connected nodes / dashboard-like shapes */}
      <div
        aria-hidden
        className="auth-illustration__art"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.1',
          maxWidth: 380,
          margin: '0 auto 32px',
        }}
      >
        <svg
          viewBox="0 0 280 260"
          fill="none"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="auth-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="auth-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* Central orb */}
          <circle cx="140" cy="120" r="48" fill="url(#auth-grad-1)" opacity={0.9} />
          <circle cx="140" cy="120" r="32" fill={theme.accent} fillOpacity={0.12} />
          {/* Nodes */}
          {[
            [60, 50],
            [220, 55],
            [70, 200],
            [210, 195],
            [140, 30],
          ].map(([x, y], i) => (
            <g key={i}>
              <line
                x1={140}
                y1={120}
                x2={x}
                y2={y}
                stroke={theme.accent}
                strokeOpacity={0.2}
                strokeWidth={1.5}
              />
              <circle cx={x} cy={y} r={10} fill={theme.accent} fillOpacity={0.15} />
              <circle cx={x} cy={y} r={4} fill={theme.accent} fillOpacity={0.5} />
            </g>
          ))}
          {/* Glass panel shapes */}
          <rect x="40" y="100" width="70" height="44" rx="10" fill="url(#auth-grad-2)" fillOpacity={0.6} />
          <rect x="170" y="100" width="70" height="44" rx="10" fill="url(#auth-grad-2)" fillOpacity={0.5} />
        </svg>
      </div>

      {/* Brand wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}
        >
          <RocketOutlined />
        </span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.02em',
            color: theme.textPrimary,
          }}
        >
          Life OS
        </span>
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 12,
          lineHeight: 1.25,
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        Your Personal Life Operating System
      </h1>

      {/* Supporting text */}
      <p
        style={{
          fontSize: 16,
          color: theme.textSecondary,
          lineHeight: 1.6,
          margin: 0,
          textAlign: 'center',
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Track, understand, and improve every domain of your life. One intelligent system for health, wealth, focus, relationships, and growth.
      </p>
    </div>
  )
}
