/**
 * Minimal auth entry page: split-screen layout.
 * Left = illustration + branding. Right = Sign In / Sign Up card.
 */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthIllustrationPanel } from '../components/auth/AuthIllustrationPanel'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthTabs, type AuthTab } from '../components/auth/AuthTabs'
import { SignInForm, type SignInValues } from '../components/auth/SignInForm'
import { SignUpForm, type SignUpValues } from '../components/auth/SignUpForm'
import { useTheme } from '../hooks/useTheme'

export interface AuthPageProps {
  /** Initial tab when mounted (e.g. from /signin or /signup). */
  initialTab?: AuthTab
}

export function AuthPage({ initialTab }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab ?? 'signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  // Sync tab from route
  useEffect(() => {
    if (location.pathname === '/signup') setTab('signup')
    else if (location.pathname === '/signin') setTab('signin')
  }, [location.pathname])

  // Redirect when already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app/control-room', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  const handleSignIn = async (values: SignInValues) => {
    setLoading(true)
    setError('')
    try {
      await signIn(values.email, values.password)
      navigate('/app/control-room', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (values: SignUpValues) => {
    setLoading(true)
    setError('')
    try {
      await signUp(values.email, values.name, values.password)
      navigate('/app/control-room', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (newTab: AuthTab) => {
    setTab(newTab)
    setError('')
    navigate(newTab === 'signin' ? '/signin' : '/signup', { replace: true })
  }

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.contentBg,
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <AuthLayout illustration={<AuthIllustrationPanel />}>
      <AuthCard>
        <AuthTabs active={tab} onChange={handleTabChange} />
        {tab === 'signin' ? (
          <SignInForm
            onSubmit={handleSignIn}
            loading={loading}
            error={error}
          />
        ) : (
          <SignUpForm
            onSubmit={handleSignUp}
            loading={loading}
            error={error}
          />
        )}
      </AuthCard>
    </AuthLayout>
  )
}
