/**
 * Sign Up form: full name, email, password, confirm password, submit.
 */
import { Form, Input, Button } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

export interface SignUpValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface SignUpFormProps {
  onSubmit: (values: SignUpValues) => Promise<void>
  loading?: boolean
  error?: string
}

export function SignUpForm({ onSubmit, loading, error }: SignUpFormProps) {
  const theme = useTheme()

  return (
    <Form
      name="signup"
      layout="vertical"
      requiredMark={false}
      onFinish={onSubmit}
      autoComplete="off"
      style={{ marginBottom: 0 }}
    >
      <Form.Item
        name="name"
        label={<span style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 500 }}>Full name</span>}
        rules={[{ required: true, message: 'Name required' }]}
      >
        <Input
          placeholder="Jane Doe"
          size="large"
          style={{
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 15,
          }}
        />
      </Form.Item>
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
        rules={[
          { required: true, message: 'Password required' },
          { min: 6, message: 'At least 6 characters' },
        ]}
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
      <Form.Item
        name="confirmPassword"
        label={<span style={{ color: theme.textSecondary, fontSize: 14, fontWeight: 500 }}>Confirm password</span>}
        dependencies={['password']}
        rules={[
          { required: true, message: 'Confirm password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) return Promise.resolve()
              return Promise.reject(new Error('Passwords do not match'))
            },
          }),
        ]}
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
          icon={<UserAddOutlined />}
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
          Create account
        </Button>
      </Form.Item>
      <p style={{ textAlign: 'center', margin: 0, fontSize: 14, color: theme.textSecondary }}>
        Already have an account?{' '}
        <Link to="/signin" style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </Form>
  )
}
