import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { LoginOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'

const { Title } = Typography

export function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth()
  const theme = useTheme()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app/control-room', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const onFinish = async (values: { email: string; password: string }) => {
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: theme.contentBg,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: theme.shadowMd,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Sign In
        </Title>
        <Form
          name="signin"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email required' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password required' }]}
          >
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>
          {error && (
            <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
              size="large"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
                border: 'none',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: theme.textSecondary }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
