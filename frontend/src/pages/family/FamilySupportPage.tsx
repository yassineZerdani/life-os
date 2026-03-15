/**
 * Family support page: responsibilities board, care by member.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, Tag } from 'antd'
import { HeartOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { familyService } from '../../services/family'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

const CATEGORY_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'financial', label: 'Financial' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'deferred', label: 'Deferred' },
]

export function FamilySupportPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: responsibilities, isLoading } = useQuery({
    queryKey: ['family', 'responsibilities'],
    queryFn: () => familyService.listResponsibilities(),
  })

  const { data: members } = useQuery({
    queryKey: ['family', 'members'],
    queryFn: () => familyService.listMembers(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      familyService.createResponsibility({
        title: values.title as string,
        description: values.description as string,
        due_date: values.due_date ? dayjs(values.due_date as string).format('YYYY-MM-DD') : undefined,
        status: (values.status as string) || 'pending',
        category: values.category as string,
        family_member_id: values.family_member_id as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      familyService.updateResponsibility(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  })

  if (isLoading || !responsibilities) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading support...</div>
  }

  const memberMap = (members || []).reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {} as Record<string, string>)
  const pending = responsibilities.filter((r) => r.status === 'pending' || r.status === 'in_progress')
  const done = responsibilities.filter((r) => r.status === 'done')

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <HeartOutlined style={{ marginRight: 8 }} />
            Support & care
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Responsibilities, appointments, follow-ups</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/relationships/family')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
            Add responsibility
          </Button>
        </div>
      </div>

      <Card
        title="Pending"
        style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
      >
        {pending.length === 0 ? (
          <Text type="secondary">No pending items. Add health needs, appointments, or follow-ups.</Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 10,
                  background: theme.hoverBg,
                  border: `1px solid ${theme.contentCardBorder}`,
                }}
              >
                <div>
                  <Text strong>{r.title}</Text>
                  {r.family_member_id && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{memberMap[r.family_member_id]}</Text>
                  )}
                  <div style={{ marginTop: 4 }}>
                    <Tag>{r.category}</Tag>
                    {r.due_date && <Tag color="blue">{r.due_date}</Tag>}
                  </div>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => updateMutation.mutate({ id: r.id, status: 'done' })}
                >
                  Mark done
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {done.length > 0 && (
        <Card
          size="small"
          title="Done"
          style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {done.slice(0, 10).map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <Text type="secondary">{r.title}</Text>
                <Tag color="green">Done</Tag>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal title="Add responsibility" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose width={480}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) =>
            createMutation.mutate({
              ...v,
              due_date: v.due_date ? dayjs(v.due_date).format('YYYY-MM-DD') : undefined,
            })
          }
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Dad's doctor follow-up" />
          </Form.Item>
          <Form.Item name="family_member_id" label="For">
            <Select
              options={members?.map((m) => ({ value: m.id, label: m.name })) || []}
              placeholder="Optional"
              allowClear
            />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORY_OPTIONS} placeholder="Select" />
          </Form.Item>
          <Form.Item name="due_date" label="Due date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="description" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="pending">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
