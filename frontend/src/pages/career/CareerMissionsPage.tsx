/**
 * Mission Map page: list missions, add/edit missions and milestones.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker, Empty } from 'antd'
import { AimOutlined, PlusOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { careerService } from '../../services/career'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

const PHASE_OPTIONS = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'building', label: 'Building' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'maintaining', label: 'Maintaining' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function CareerMissionsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [missionModalOpen, setMissionModalOpen] = useState(false)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [missionForm] = Form.useForm()
  const [milestoneForm] = Form.useForm()

  const { data: missions, isLoading } = useQuery({
    queryKey: ['career', 'missions'],
    queryFn: () => careerService.listMissions(),
  })

  const createMissionMutation = useMutation({
    mutationFn: (values: { title: string; description?: string; status?: string; phase?: string; priority?: number; target_date?: string }) =>
      careerService.createMission({
        title: values.title,
        description: values.description,
        status: values.status || 'active',
        phase: values.phase,
        priority: values.priority,
        target_date: values.target_date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] })
      setMissionModalOpen(false)
      missionForm.resetFields()
    },
  })

  const createMilestoneMutation = useMutation({
    mutationFn: (values: { mission_id: string; title: string; description?: string; status?: string; order_index?: number }) =>
      careerService.createMilestone(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career'] })
      setMilestoneModalOpen(false)
      setSelectedMissionId(null)
      milestoneForm.resetFields()
    },
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string } }) =>
      careerService.updateMilestone(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['career'] }),
  })

  if (isLoading || !missions) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading missions...</div>
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <AimOutlined style={{ marginRight: 8 }} />
            Mission Map
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>What matters and how you get there</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/career')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setMissionModalOpen(true)} style={{ borderRadius: 10 }}>
            Add mission
          </Button>
        </div>
      </div>

      {missions.length === 0 ? (
        <Card style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}>
          <Empty description="No missions yet. Define a major life or work mission.">
            <Button type="primary" onClick={() => setMissionModalOpen(true)}>Create first mission</Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {missions.map((m) => (
            <Card
              key={m.id}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong>{m.title}</Text>
                  {m.phase && <Tag color={DOMAIN_COLORS.career}>{m.phase}</Tag>}
                  <Tag>{m.status}</Tag>
                </div>
              }
              style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
              extra={
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedMissionId(m.id)
                    milestoneForm.setFieldsValue({ mission_id: m.id, order_index: m.milestones.length })
                    setMilestoneModalOpen(true)
                  }}
                >
                  Milestone
                </Button>
              }
            >
              {m.description && <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>{m.description}</Text>}
              {m.target_date && <Text type="secondary" style={{ fontSize: 12 }}>Target: {m.target_date}</Text>}
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Milestones</Text>
                {m.milestones.length === 0 ? (
                  <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>None yet</Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {m.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: 8,
                          borderRadius: 8,
                          background: theme.hoverBg,
                        }}
                      >
                        {ms.status === 'completed' ? (
                          <CheckOutlined style={{ color: '#22c55e' }} />
                        ) : (
                          <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${theme.contentCardBorder}` }} />
                        )}
                        <Text delete={ms.status === 'completed'} style={{ flex: 1 }}>{ms.title}</Text>
                        <Button
                          type="text"
                          size="small"
                          onClick={() =>
                            updateMilestoneMutation.mutate({
                              id: ms.id,
                              data: { status: ms.status === 'completed' ? 'pending' : 'completed' },
                            })
                          }
                        >
                          {ms.status === 'completed' ? 'Reopen' : 'Complete'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal title="New mission" open={missionModalOpen} onCancel={() => setMissionModalOpen(false)} footer={null} destroyOnClose>
        <Form form={missionForm} layout="vertical" onFinish={(v) => createMissionMutation.mutate({ ...v, target_date: v.target_date ? dayjs(v.target_date).format('YYYY-MM-DD') : undefined })}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Become an elite backend engineer" />
          </Form.Item>
          <Form.Item name="description" label="Why it matters">
            <Input.TextArea rows={3} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="phase" label="Phase">
            <Select options={PHASE_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="active">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="target_date" label="Target date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMissionMutation.isPending}>Create</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="New milestone" open={milestoneModalOpen} onCancel={() => { setMilestoneModalOpen(false); setSelectedMissionId(null) }} footer={null} destroyOnClose>
        <Form
          form={milestoneForm}
          layout="vertical"
          onFinish={(v) => createMilestoneMutation.mutate({ ...v, mission_id: selectedMissionId || v.mission_id })}
        >
          <Form.Item name="mission_id" hidden><Input /></Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ship first API" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="order_index" label="Order">
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMilestoneMutation.isPending}>Add milestone</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
