/**
 * Love timeline — milestones, moments, trips, plans, promises, repairs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { loveService } from '../../services/love'
import { useTheme } from '../../hooks/useTheme'
import { LoveTimeline } from '../../components/love'
import type { LoveMemory } from '../../services/love'

const { Title, Text } = Typography

const MEMORY_CATEGORIES = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'moment', label: 'Moment' },
  { value: 'trip', label: 'Trip' },
  { value: 'plan', label: 'Plan' },
  { value: 'promise', label: 'Promise' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
]

export function LoveTimelinePage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LoveMemory | null>(null)
  const [form] = Form.useForm()

  const { data: memories, isLoading } = useQuery({
    queryKey: ['love', 'memories'],
    queryFn: () => loveService.listMemories(undefined, 100),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      loveService.createMemory({
        title: values.title as string,
        description: values.description as string,
        date: values.date ? dayjs(values.date as string).format('YYYY-MM-DD') : undefined,
        category: values.category as string,
        media_url: values.media_url as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => loveService.deleteMemory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['love'] }),
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Love timeline
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Milestones, moments, trips, plans, and promises — your shared story.
        </Text>
      </div>

      <LoveTimeline
        memories={memories ?? []}
        onAdd={() => setModalOpen(true)}
        onEdit={setEditing}
        loading={isLoading}
      />

      <Modal
        title="Add moment"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. First trip together" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={MEMORY_CATEGORIES} placeholder="Choose category" />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional details" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 10 }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {editing && (
        <Modal
          title="Edit moment"
          open={!!editing}
          onCancel={() => setEditing(null)}
          footer={[
            <Button key="delete" danger onClick={() => { deleteMutation.mutate(editing.id); setEditing(null); }}>
              Delete
            </Button>,
            <Button key="cancel" onClick={() => setEditing(null)}>Cancel</Button>,
          ]}
          width={480}
          destroyOnClose
        >
          <Typography>
            <Text strong>{editing.title}</Text>
            <br />
            <Text type="secondary">{editing.description ?? '—'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {editing.date
                ? new Date(editing.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'No date'}
            </Text>
          </Typography>
        </Modal>
      )}
    </div>
  )
}
