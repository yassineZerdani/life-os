import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Form, Input, InputNumber, Select, Button, Typography } from 'antd'
import { profileService } from '../../services/profile'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

export function PersonProfilePage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'person'],
    queryFn: () => profileService.getPerson(),
  })

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => profileService.updatePerson(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  if (isLoading || !data) return null

  return (
    <div>
      <Title level={3} style={{ marginBottom: 8, color: theme.textPrimary }}>Personal Profile</Title>
      <Text style={{ color: theme.textSecondary, display: 'block', marginBottom: 24 }}>
        Basic identity and life context used to personalize your experience.
      </Text>
      <Card style={{ maxWidth: 560, background: theme.cardBg, border: `1px solid ${theme.borderColor ?? '#e2e8f0'}` }}>
        <Form
          layout="vertical"
          initialValues={{
            full_name: data.full_name ?? '',
            preferred_name: data.preferred_name ?? '',
            birth_year: data.birth_year ?? undefined,
            location: data.location ?? '',
            timezone: data.timezone ?? '',
            occupation: data.occupation ?? '',
            relationship_status: data.relationship_status ?? undefined,
            living_situation: data.living_situation ?? undefined,
          }}
          onFinish={(v) => updateMutation.mutate(v)}
        >
          <Form.Item name="full_name" label="Full name"><Input placeholder="Full name" /></Form.Item>
          <Form.Item name="preferred_name" label="Preferred name"><Input placeholder="What to call you" /></Form.Item>
          <Form.Item name="birth_year" label="Birth year">
            <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} placeholder="1990" />
          </Form.Item>
          <Form.Item name="location" label="Location"><Input placeholder="City or region" /></Form.Item>
          <Form.Item name="timezone" label="Timezone"><Input placeholder="e.g. America/New_York" /></Form.Item>
          <Form.Item name="occupation" label="Occupation"><Input placeholder="Job or role" /></Form.Item>
          <Form.Item name="relationship_status" label="Relationship status">
            <Select allowClear placeholder="Select" options={[
              { value: 'single', label: 'Single' }, { value: 'partnered', label: 'Partnered' },
              { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' },
            ]} />
          </Form.Item>
          <Form.Item name="living_situation" label="Living situation">
            <Select allowClear placeholder="Select" options={[
              { value: 'alone', label: 'Alone' }, { value: 'family', label: 'With family' },
              { value: 'roommates', label: 'Roommates' }, { value: 'partner', label: 'With partner' },
            ]} />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Save</Button></Form.Item>
        </Form>
      </Card>
    </div>
  )
}
