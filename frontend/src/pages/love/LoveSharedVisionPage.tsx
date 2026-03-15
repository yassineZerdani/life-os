/**
 * Shared vision — life, travel, home, family, career, values. Align on the future.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker } from 'antd'
import { useState } from 'react'
import dayjs from 'dayjs'
import { loveService } from '../../services/love'
import { useTheme } from '../../hooks/useTheme'
import { SharedVisionBoard } from '../../components/love'
import type { SharedVisionItem } from '../../services/love'

const { Title, Text } = Typography

const VISION_CATEGORIES = [
  { value: 'life', label: 'Life' },
  { value: 'travel', label: 'Travel' },
  { value: 'home', label: 'Home' },
  { value: 'family', label: 'Family' },
  { value: 'career', label: 'Career' },
  { value: 'values', label: 'Values' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
]

export function LoveSharedVisionPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SharedVisionItem | null>(null)
  const [form] = Form.useForm()

  const { data: items, isLoading } = useQuery({
    queryKey: ['love', 'shared-vision'],
    queryFn: () => loveService.listSharedVision(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      loveService.createSharedVision({
        category: values.category as string,
        title: values.title as string,
        description: values.description as string,
        target_date: values.target_date ? dayjs(values.target_date as string).format('YYYY-MM-DD') : undefined,
        status: (values.status as string) ?? 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SharedVisionItem> }) =>
      loveService.updateSharedVision(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['love'] })
      setEditing(null)
    },
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Shared vision
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Goals, dreams, and plans you want to build toward together.
        </Text>
      </div>

      <SharedVisionBoard
        items={items ?? []}
        onAdd={() => setModalOpen(true)}
        onEdit={setEditing}
        onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
        loading={isLoading}
      />

      <Modal
        title="Add vision item"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={VISION_CATEGORIES} placeholder="Choose category" />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Buy a home together" />
          </Form.Item>
          <Form.Item name="target_date" label="Target date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional details" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={STATUS_OPTIONS} />
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
          title="Edit vision item"
          open={!!editing}
          onCancel={() => setEditing(null)}
          footer={null}
          width={480}
          destroyOnClose
        >
          <Form
            layout="vertical"
            initialValues={{
              category: editing.category,
              title: editing.title,
              description: editing.description ?? '',
              target_date: editing.target_date ? dayjs(editing.target_date) : null,
              status: editing.status,
            }}
            onFinish={(values) =>
              updateMutation.mutate({
                id: editing.id,
                data: {
                  category: values.category,
                  title: values.title,
                  description: values.description || undefined,
                  target_date: values.target_date ? dayjs(values.target_date).format('YYYY-MM-DD') : undefined,
                  status: values.status,
                },
              })
            }
          >
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select options={VISION_CATEGORIES} />
            </Form.Item>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="target_date" label="Target date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending} style={{ borderRadius: 10 }}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  )
}
