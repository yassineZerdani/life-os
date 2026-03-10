/**
 * Placeholder for forgot password flow.
 * Backend may not support reset yet; link exists for UX.
 */
import { Link } from 'react-router-dom'
import { Form, Input, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useTheme } from '../hooks/useTheme'
import { AuthCard } from '../components/auth/AuthCard'

export function ForgotPasswordPage() {
  const theme = useTheme()

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
      <AuthCard>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: theme.textPrimary }}>
          Reset password
        </h2>
        <p style={{ margin: '0 0 24px', color: theme.textSecondary, fontSize: 14 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        <Form layout="vertical" onFinish={() => {}}>
          <Form.Item name="email" rules={[{ required: true }, { type: 'email' }]}>
            <Input placeholder="Email" size="large" style={{ borderRadius: 12 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 12, height: 48 }}>
              Send reset link
            </Button>
          </Form.Item>
        </Form>
        <Link
          to="/signin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: theme.accent,
            fontSize: 14,
            textDecoration: 'none',
            marginTop: 16,
          }}
        >
          <ArrowLeftOutlined /> Back to Sign in
        </Link>
      </AuthCard>
    </div>
  )
}
