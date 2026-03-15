/**
 * Couple pulse — list and add pulse entries (closeness, communication, trust, tension, support, future alignment).
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, InputNumber, Input, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { loveService } from '../../services/love'
import { useTheme } from '../../hooks/useTheme'
import { CouplePulseCard } from '../../components/love'

const { Title, Text } = Typography

const SCORE_FIELDS = [
  { name: 'closeness_score', label: 'Closeness' },
  { name: 'communication_score', label: 'Communication' },
  { name: 'trust_score', label: 'Trust' },
  { name: 'tension_score', label: 'Tension' },
  { name: 'support_score', label: 'Support' },
  { name: 'future_alignment_score', label: 'Future alignment' },
]

export function LovePulsePage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: entries, isLoading } = useQuery({
    queryKey: ['love', 'pulse'],
    queryFn: () => loveService.listPulseEntries(30),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      loveService.createPulseEntry({
        date: dayjs(values.date as string).format('YYYY-MM-DD'),
        closeness_score: values.closeness_score != null ? Number(values.closeness_score) : undefined,
        communication_score: values.communication_score != null ? Number(values.communication_score) : undefined,
        trust_score: values.trust_score != null ? Number(values.trust_score) : undefined,
        tension_score: values.tension_score != null ? Number(values.tension_score) : undefined,
        support_score: values.support_score != null ? Number(values.support_score) : undefined,
        future_alignment_score: values.future_alignment_score != null ? Number(values.future_alignment_score) : undefined,
        notes: values.notes as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Couple pulse
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Track closeness, communication, trust, tension, support, and future alignment (0–10).
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
          Add pulse
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: theme.textMuted }}>Loading pulse history…</div>
      ) : !entries?.length ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">No pulse entries yet. Add a check-in to see patterns over time.</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
              Add first pulse
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.map((e) => (
            <CouplePulseCard key={e.id} entry={e} />
          ))}
        </div>
      )}

      <Modal
        title="Add pulse entry"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs().format('YYYY-MM-DD') }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          {SCORE_FIELDS.map(({ name, label }) => (
            <Form.Item key={name} name={name} label={label}>
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} placeholder="0–10" />
            </Form.Item>
          ))}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional context" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 10 }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
