/**
 * Achievement timeline: meaningful wins by category (business, technical, financial, etc.).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, Tag, Empty } from 'antd'
import { TrophyOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { careerService } from '../../services/career'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

const CATEGORY_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
  { value: 'financial', label: 'Financial' },
  { value: 'social_professional', label: 'Social / Professional' },
  { value: 'personal_growth', label: 'Personal growth' },
]

const IMPACT_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'transformative', label: 'Transformative' },
]

export function CareerAchievementsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['career', 'achievements'],
    queryFn: () => careerService.listAchievements(undefined, 100),
  })

  const createMutation = useMutation({
    mutationFn: (values: { title: string; description?: string; category: string; impact_level?: string; date: string; proof_url?: string }) =>
      careerService.createAchievement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => careerService.deleteAchievement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['career'] }),
  })

  if (isLoading || !achievements) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading achievements...</div>
  }

  const byCategory = achievements.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = []
    acc[a.category].push(a)
    return acc
  }, {} as Record<string, typeof achievements>)

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <TrophyOutlined style={{ marginRight: 8 }} />
            Achievement timeline
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Meaningful wins, not just tasks</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/career')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
            Log achievement
          </Button>
        </div>
      </div>

      {achievements.length === 0 ? (
        <Card style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}>
          <Empty description="No achievements yet. Log shipped products, landed clients, hard projects.">
            <Button type="primary" onClick={() => setModalOpen(true)}>Log first achievement</Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CATEGORY_OPTIONS.map(({ value }) => {
            const items = byCategory[value] || []
            if (items.length === 0) return null
            return (
              <Card
                key={value}
                size="small"
                title={<span style={{ textTransform: 'capitalize' }}>{value.replace('_', ' ')}</span>}
                style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        padding: 12,
                        borderRadius: 10,
                        background: theme.hoverBg,
                        border: `1px solid ${theme.contentCardBorder}`,
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 14 }}>{a.title}</Text>
                        {a.description && (
                          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{a.description}</Text>
                        )}
                        <div style={{ marginTop: 6 }}>
                          <Tag>{a.date}</Tag>
                          {a.impact_level && <Tag color="blue">{a.impact_level}</Tag>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {a.proof_url && (
                          <Button type="link" size="small" icon={<LinkOutlined />} href={a.proof_url} target="_blank" rel="noopener noreferrer" />
                        )}
                        <Button type="text" size="small" danger onClick={() => deleteMutation.mutate(a.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal title="Log achievement" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs().format('YYYY-MM-DD') }}
          onFinish={(v) => createMutation.mutate({ ...v, date: typeof v.date === 'string' ? v.date : dayjs(v.date).format('YYYY-MM-DD') })}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Shipped first product" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORY_OPTIONS} placeholder="Select" />
          </Form.Item>
          <Form.Item name="impact_level" label="Impact">
            <Select options={IMPACT_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="proof_url" label="Proof URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Log</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
