import { Form, InputNumber, Input, Button, Select, Card } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { xpEventsService } from '../../services/xpEvents'
import { domainsService } from '../../services/domains'
import { useQuery } from '@tanstack/react-query'
import type { Domain } from '../../types'

const XP_PRESETS = [
  { value: 'gym_session', label: 'Gym session (+40)', xp: 40 },
  { value: 'learning_1h', label: 'Learning 1h (+25)', xp: 25 },
  { value: 'saving_money', label: 'Saving money (+20)', xp: 20 },
  { value: 'networking_event', label: 'Networking event (+30)', xp: 30 },
  { value: 'meaningful_conversation', label: 'Meaningful conversation (+30)', xp: 30 },
  { value: 'travel_experience', label: 'Travel experience (+40)', xp: 40 },
  { value: 'career_milestone', label: 'Career milestone (+50)', xp: 50 },
]

interface XPEventFormProps {
  onSuccess?: () => void
}

export function XPEventForm({ onSuccess }: XPEventFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: domainsService.list,
  })

  const mutation = useMutation({
    mutationFn: (values: { domain: string; xp_amount: number; reason: string }) =>
      xpEventsService.create({
        domain: values.domain,
        xp_amount: values.xp_amount,
        reason: values.reason,
        source_type: 'manual',
      }),
    onSuccess: () => {
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      onSuccess?.()
    },
  })

  return (
    <Card title="Award XP" size="small">
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) => {
          const preset = XP_PRESETS.find((p) => p.value === v.preset)
          mutation.mutate({
            domain: v.domain,
            xp_amount: preset?.xp ?? v.xp_amount ?? 10,
            reason: preset ? preset.label.replace(/ \(\+\d+\)/, '') : v.reason || 'Custom',
          })
        }}
      >
        <Form.Item name="domain" label="Domain" rules={[{ required: true }]}>
          <Select
            placeholder="Select domain"
            options={domains?.map((d: Domain) => ({ label: d.name, value: d.slug }))}
          />
        </Form.Item>
        <Form.Item name="preset" label="Quick preset">
          <Select
            placeholder="Or enter custom below"
            allowClear
            options={XP_PRESETS}
          />
        </Form.Item>
        <Form.Item name="xp_amount" label="XP Amount">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Custom XP" />
        </Form.Item>
        <Form.Item name="reason" label="Reason">
          <Input placeholder="What did you do?" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Award XP
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
