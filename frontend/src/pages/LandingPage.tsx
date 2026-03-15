/**
 * Landing / informational page — the first page visitors see.
 * Outside the dashboard (no auth required). Public-facing.
 */
import { Button, Typography, Spin, Dropdown } from 'antd'
import {
  RocketOutlined,
  LoginOutlined,
  UserAddOutlined,
  BgColorsOutlined,
  HeartOutlined,
  BookOutlined,
  BarChartOutlined,
  BulbOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { useAppStore } from '../store/useAppStore'

const { Title, Paragraph } = Typography

const FEATURES = [
  { icon: <HeartOutlined />, title: 'Life domains', desc: 'Health, wealth, skills, relationships, and more in one place.' },
  { icon: <BookOutlined />, title: 'Knowledge library', desc: 'Evidence-based articles on psychology, finance, and productivity.' },
  { icon: <BarChartOutlined />, title: 'Analytics & timeline', desc: 'Track time, goals, and see how your life balances over time.' },
  { icon: <BulbOutlined />, title: 'Strategy library', desc: 'CBT, deep work, budgeting protocols—apply what works.' },
  { icon: <TrophyOutlined />, title: 'Quests & achievements', desc: 'Gamify progress and stay motivated.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const theme = useTheme()
  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/app/control-room', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.contentBg,
        color: theme.textPrimary,
      }}
    >
      {/* Top bar: logo + Sign In / theme — outside dashboard */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: `1px solid ${theme.border}`,
          background: theme.topBarBg,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? '/app' : '/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
            }}
          >
            <RocketOutlined />
          </span>
          <span style={{ fontWeight: 700, fontSize: 18, color: theme.textPrimary }}>Life OS</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Dropdown
            menu={{
              items: [
                { key: 'light', label: 'Light', onClick: () => setThemeMode('light') },
                { key: 'dark', label: 'Dark', onClick: () => setThemeMode('dark') },
                { key: 'boys', label: 'Boys', onClick: () => setThemeMode('boys') },
                { key: 'girls', label: 'Girls', onClick: () => setThemeMode('girls') },
                { key: 'light-boys', label: 'Light Boys', onClick: () => setThemeMode('light-boys') },
                { key: 'light-girls', label: 'Light Girls', onClick: () => setThemeMode('light-girls') },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<BgColorsOutlined />}
              style={{ color: theme.textMuted }}
              title="Theme"
            />
          </Dropdown>
          {isAuthenticated ? (
            <Button type="primary" onClick={() => navigate('/app')} style={{ background: theme.accent, borderColor: theme.accent }}>
              Go to app
            </Button>
          ) : (
            <Button type="text" icon={<LoginOutlined />} onClick={() => navigate('/signin')} style={{ color: theme.textSecondary }}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: '64px 24px 56px',
          textAlign: 'center',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <Title level={1} style={{ marginBottom: 16, color: theme.textPrimary, fontSize: 36, fontWeight: 700 }}>
          Your personal operating system for life
        </Title>
        <Paragraph style={{ fontSize: 18, color: theme.textSecondary, lineHeight: 1.7, marginBottom: 40 }}>
          Track what matters across health, wealth, skills, and relationships. Use evidence-based strategies,
          run simulations, and build a knowledge graph of your life—all in one place.
        </Paragraph>
        {!isAuthenticated && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/signup')}
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
                border: 'none',
                borderRadius: theme.radius,
                padding: '0 32px',
                height: 48,
              }}
            >
              Get started free
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/signin')}
              style={{ borderRadius: theme.radius, padding: '0 32px', height: 48 }}
            >
              Sign In
            </Button>
          </div>
        )}
      </section>

      {/* Features / informational section */}
      <section
        style={{
          padding: '48px 24px 64px',
          borderTop: `1px solid ${theme.border}`,
          background: theme.contentCardBg,
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Title level={3} style={{ textAlign: 'center', color: theme.textPrimary, marginBottom: 40 }}>
            What you get
          </Title>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background: theme.contentBg,
                }}
              >
                <span style={{ fontSize: 24, color: theme.accent, marginBottom: 12, display: 'block' }}>{f.icon}</span>
                <Title level={5} style={{ margin: '0 0 8px', color: theme.textPrimary }}>
                  {f.title}
                </Title>
                <Paragraph style={{ margin: 0, color: theme.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
                  {f.desc}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          padding: '56px 24px 64px',
          textAlign: 'center',
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <Title level={4} style={{ color: theme.textPrimary, marginBottom: 12 }}>
          Ready to take control?
        </Title>
        <Paragraph style={{ color: theme.textSecondary, marginBottom: 24 }}>
          Create your account and open your Control Room in seconds.
        </Paragraph>
        {!isAuthenticated && (
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate('/signup')}
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
              border: 'none',
              borderRadius: theme.radius,
              padding: '0 32px',
              height: 48,
            }}
          >
            Sign up — it’s free
          </Button>
        )}
      </section>
    </div>
  )
}
