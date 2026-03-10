import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Form, Input, Select, Switch, Button, Typography } from 'antd'
import { profileService } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

export function AppSettingsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'app'],
    queryFn: () => profileService.getApp(),
  })

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => profileService.updateApp(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  if (isLoading || !data) return null

  return (
    <div>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>App Settings</Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Theme, notifications, timezone, and language.
      </Text>
      <Card style={{ maxWidth: 560, background: theme.cardBg, border: `1px solid ${theme.borderColor ?? '#e2e8f0'}` }}>
        <Form
          layout="vertical"
          initialValues={{
            theme: data.theme ?? 'system',
            dark_mode: data.dark_mode ?? false,
            notifications_enabled: data.notifications_enabled ?? true,
            timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: data.language ?? 'en',
          }}
          onFinish={(v) => updateMutation.mutate(v)}
        >
          <Form.Item name="theme" label="Theme">
            <Select options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }]} />
          </Form.Item>
          <Form.Item name="dark_mode" label="Dark mode" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="notifications_enabled" label="Notifications" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="timezone" label="Timezone"><Input placeholder="e.g. America/New_York" /></Form.Item>
          <Form.Item name="language" label="Language">
            <Select options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]} />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Save</Button></Form.Item>
        </Form>
      </Card>
    </div>
  )
}
