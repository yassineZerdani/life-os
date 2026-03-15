/**
 * Opportunity pipeline: freelance, jobs, partnerships, ideas, collaborations, investment.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, Tag, Empty } from 'antd'
import { FolderOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { careerService } from '../../services/career'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

const TYPE_OPTIONS = [
  { value: 'freelance_lead', label: 'Freelance lead' },
  { value: 'job', label: 'Job' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'startup_idea', label: 'Startup idea' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'investment', label: 'Investment' },
]

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'deferred', label: 'Deferred' },
]

export function CareerOpportunitiesPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['career', 'opportunities'],
    queryFn: () => careerService.listOpportunities(),
  })

  const createMutation = useMutation({
    mutationFn: (values: { title: string; type: string; source?: string; status?: string; value_estimate?: string; notes?: string }) =>
      careerService.createOpportunity(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      careerService.updateOpportunity(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['career'] }),
  })

  if (isLoading || !opportunities) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading opportunities...</div>
  }

  const byStatus = { open: [] as typeof opportunities, in_progress: [] as typeof opportunities, won: [] as typeof opportunities, lost: [] as typeof opportunities, deferred: [] as typeof opportunities }
  opportunities.forEach((o) => {
    if (byStatus[o.status as keyof typeof byStatus]) byStatus[o.status as keyof typeof byStatus].push(o)
    else byStatus.open.push(o)
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <FolderOutlined style={{ marginRight: 8 }} />
            Opportunity pipeline
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Leads, jobs, partnerships, ideas</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/career')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
            Add opportunity
          </Button>
        </div>
      </div>

      {opportunities.length === 0 ? (
        <Card style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}>
          <Empty description="No opportunities yet. Add leads, jobs, or ideas.">
            <Button type="primary" onClick={() => setModalOpen(true)}>Add first opportunity</Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {(['open', 'in_progress', 'won', 'lost', 'deferred'] as const).map((status) => (
            <Card
              key={status}
              size="small"
              title={<span style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>}
              style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
            >
              {(byStatus[status] || []).length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>None</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(byStatus[status] || []).map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background: theme.hoverBg,
                        border: `1px solid ${theme.contentCardBorder}`,
                      }}
                    >
                      <Text strong style={{ fontSize: 13 }}>{o.title}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag>{o.type.replace('_', ' ')}</Tag>
                        {o.value_estimate && <Tag color="blue">{o.value_estimate}</Tag>}
                      </div>
                      <Select
                        size="small"
                        value={o.status}
                        options={STATUS_OPTIONS}
                        onChange={(v) => updateStatusMutation.mutate({ id: o.id, status: v })}
                        style={{ width: '100%', marginTop: 6 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal title="New opportunity" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Backend contract with Acme" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} placeholder="Select type" />
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Input placeholder="Where did it come from?" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="open">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="value_estimate" label="Value estimate">
            <Input placeholder="e.g. $5k, Equity" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Add</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
