/**
 * Relationship depth — dashboard: pulse, conflicts, vision, reconnect, insights.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker } from 'antd'
import { ArrowLeftOutlined, LineChartOutlined, HistoryOutlined, AimOutlined, BulbOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { loveService } from '../../services/love'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import { CouplePulseCard, ReconnectSuggestions, ConflictRepairAssistant } from '../../components/love'

const { Title, Text } = Typography

const RECONNECT_CATEGORIES = [
  { value: 'date', label: 'Date' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'gesture', label: 'Gesture' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'surprise', label: 'Surprise' },
  { value: 'other', label: 'Other' },
]

export function LovePage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [reconnectModalOpen, setReconnectModalOpen] = useState(false)
  const [reconnectForm] = Form.useForm()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['love', 'dashboard'],
    queryFn: () => loveService.getDashboard(),
  })

  const { data: conflicts } = useQuery({
    queryKey: ['love', 'conflicts'],
    queryFn: () => loveService.listConflicts(undefined, 10),
    enabled: !!dashboard,
  })

  const updateConflict = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof loveService.updateConflict>[1] }) =>
      loveService.updateConflict(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['love'] }),
  })

  const updateReconnect = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      loveService.updateReconnect(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['love'] }),
  })

  const createReconnect = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      loveService.createReconnect({
        title: values.title as string,
        description: values.description as string,
        category: values.category as string,
        due_date: values.due_date ? dayjs(values.due_date as string).format('YYYY-MM-DD') : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love'] })
      setReconnectModalOpen(false)
      reconnectForm.resetFields()
    },
  })

  const { data: reconnectList } = useQuery({
    queryKey: ['love', 'reconnect'],
    queryFn: () => loveService.listReconnect(false),
    enabled: !!dashboard,
  })

  if (isLoading || !dashboard) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        Loading relationship depth…
      </div>
    )
  }

  const { profile, latest_pulse, conflicts_pending_repair, reconnect_pending, insights } = dashboard
  const firstPendingConflict = conflicts?.find((c) => c.status !== 'reconnected')

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/app/relationships')}
        style={{ marginBottom: 16, color: theme.textMuted }}
      >
        Back to Relationships
      </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Relationship depth
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {profile.partner_name
              ? `With ${profile.partner_name} — pulse, repair, and shared vision`
              : 'Track connection, repair after conflict, and align on the future'}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={<LineChartOutlined />}
            onClick={() => navigate('/app/relationships/partner/pulse')}
            style={{ borderRadius: 10 }}
          >
            Pulse
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate('/app/relationships/partner/timeline')}
            style={{ borderRadius: 10 }}
          >
            Timeline
          </Button>
          <Button
            icon={<AimOutlined />}
            onClick={() => navigate('/app/relationships/partner/shared-vision')}
            style={{ borderRadius: 10 }}
          >
            Shared vision
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div>
          {latest_pulse ? (
            <Card
              title={<span style={{ fontWeight: 600 }}>Couple pulse</span>}
              extra={
                <Button type="link" size="small" onClick={() => navigate('/app/relationships/partner/pulse')}>
                  View history
                </Button>
              }
              style={{
                marginBottom: 24,
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <CouplePulseCard entry={latest_pulse} />
            </Card>
          ) : (
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 16,
                border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
                background: 'transparent',
              }}
            >
              <Text type="secondary">No pulse entry yet. Track closeness, communication, trust, tension, support, and future alignment.</Text>
              <div style={{ marginTop: 12 }}>
                <Button type="primary" onClick={() => navigate('/app/relationships/partner/pulse')} style={{ borderRadius: 10 }}>
                  Add pulse
                </Button>
              </div>
            </Card>
          )}

          {firstPendingConflict && (
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Repair in progress</Text>
              <ConflictRepairAssistant
                conflict={firstPendingConflict}
                onUpdate={(id, data) => updateConflict.mutate({ id, data })}
                onComplete={() => queryClient.invalidateQueries({ queryKey: ['love'] })}
              />
            </div>
          )}

          {insights.length > 0 && (
            <Card
              size="small"
              style={{
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <BulbOutlined style={{ color: DOMAIN_COLORS.love }} />
                <Text strong style={{ fontSize: 13 }}>Insights</Text>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: theme.textSecondary, fontSize: 13 }}>
                {insights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div style={{ position: 'sticky', top: 24 }}>
          <ReconnectSuggestions
            actions={reconnectList ?? []}
            onToggleComplete={(id, completed) => updateReconnect.mutate({ id, completed })}
            onAdd={() => setReconnectModalOpen(true)}
            loading={false}
          />
          {(conflicts_pending_repair > 0 || reconnect_pending > 0) && (
            <Card
              size="small"
              style={{
                marginTop: 16,
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conflicts_pending_repair > 0 && (
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => {}}>
                    {conflicts_pending_repair} conflict{conflicts_pending_repair !== 1 ? 's' : ''} pending repair
                  </Button>
                )}
                {reconnect_pending > 0 && (
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => {}}>
                    {reconnect_pending} reconnection action{reconnect_pending !== 1 ? 's' : ''} pending
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        title="Add reconnection action"
        open={reconnectModalOpen}
        onCancel={() => setReconnectModalOpen(false)}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Form
          form={reconnectForm}
          layout="vertical"
          onFinish={(values) => createReconnect.mutate(values)}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Dinner without phones" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={RECONNECT_CATEGORIES} placeholder="Choose type" />
          </Form.Item>
          <Form.Item name="due_date" label="Due date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createReconnect.isPending} style={{ borderRadius: 10 }}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
