/**
 * Sign In form: email, password, forgot link, remember me, submit.
 */
import { Form, Input, Button, Checkbox } from 'antd'
import { LoginOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

export interface SignInValues {
  email: string
  password: string
  remember?: boolean
}

interface SignInFormProps {
  onSubmit: (values: SignInValues) => Promise<void>
  loading?: boolean
  error?: string
}

export function SignInForm({ onSubmit, loading, error }: SignInFormProps) {
  const theme = useTheme()

  return (
    <Form
      name="signin"
      layout="vertical"
      requiredMark={false}
      onFinish={onSubmit}
      autoComplete="off"
      style={{ marginBottom: 0 }}
    >
      <Form.Item
        name="email"
        label={<span style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 500 }}>Email</span>}
        rules={[
          { required: true, message: 'Email required' },
          { type: 'email', message: 'Invalid email' },
        ]}
      >
        <Input
          placeholder="you@example.com"
          size="large"
          style={{
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 15,
          }}
        />
      </Form.Item>
      <Form.Item
        name="password"
        label={<span style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 500 }}>Password</span>}
        rules={[{ required: true, message: 'Password required' }]}
      >
        <Input.Password
          placeholder="••••••••"
          size="large"
          style={{
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 15,
          }}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: theme.textSecondary, fontSize: 14 }}>Remember me</Checkbox>
          </Form.Item>
          <Link
            to="/forgot-password"
            style={{
              fontSize: 14,
              color: theme.accent,
              textDecoration: 'none',
            }}
          >
            Forgot password?
          </Link>
        </div>
      </Form.Item>
      {error && (
        <div
          style={{
            color: '#ef4444',
            marginBottom: 16,
            fontSize: 14,
            padding: '10px 12px',
            background: 'rgba(239, 68, 68, 0.08)',
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}
      <Form.Item style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<LoginOutlined />}
          block
          size="large"
          style={{
            height: 48,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
            border: 'none',
            boxShadow: `0 4px 14px ${theme.accent}40`,
          }}
        >
          Sign In
        </Button>
      </Form.Item>
      <p style={{ textAlign: 'center', margin: 0, fontSize: 14, color: theme.textSecondary }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
          Sign up
        </Link>
      </p>
    </Form>
  )
}
