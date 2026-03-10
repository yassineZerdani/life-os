import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'

const { Title } = Typography

export function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signUp, isAuthenticated, isLoading: authLoading } = useAuth()
  const theme = useTheme()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/app/control-room', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const onFinish = async (values: { email: string; name: string; password: string }) => {
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
          Sign Up
        </Title>
        <Form
          name="signup"
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
            name="name"
            rules={[{ required: true, message: 'Name required' }]}
          >
            <Input placeholder="Name" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password required' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
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
              icon={<UserAddOutlined />}
              block
              size="large"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
                border: 'none',
              }}
            >
              Sign Up
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: theme.textSecondary }}>
            Already have an account? <Link to="/signin">Sign in</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
