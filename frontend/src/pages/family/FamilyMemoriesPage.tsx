/**
 * Family memory archive: stories, traditions, milestones, media.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, Tag, Empty } from 'antd'
import { FolderOutlined, PlusOutlined, LinkOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { familyService } from '../../services/family'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

export function FamilyMemoriesPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: memories, isLoading } = useQuery({
    queryKey: ['family', 'memories'],
    queryFn: () => familyService.listMemories(undefined, 100),
  })

  const { data: members } = useQuery({
    queryKey: ['family', 'members'],
    queryFn: () => familyService.listMembers(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      familyService.createMemory({
        title: values.title as string,
        description: values.description as string,
        date: values.date ? dayjs(values.date as string).format('YYYY-MM-DD') : undefined,
        media_url: values.media_url as string,
        tags: values.tags
          ? (String(values.tags).split(',').map((s) => s.trim()).filter(Boolean) as string[])
          : undefined,
        family_member_id: values.family_member_id as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => familyService.deleteMemory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  })

  if (isLoading || !memories) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading memories...</div>
  }

  const memberMap = (members || []).reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {} as Record<string, string>)

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            <FolderOutlined style={{ marginRight: 8 }} />
            Memory archive
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Stories, traditions, milestones</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => navigate('/app/relationships/family')}>Back</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
            Add memory
          </Button>
        </div>
      </div>

      {memories.length === 0 ? (
        <Card style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}>
          <Empty description="No memories yet. Preserve a story, tradition, or moment.">
            <Button type="primary" onClick={() => setModalOpen(true)}>Add first memory</Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {memories.map((mem) => (
            <Card
              key={mem.id}
              size="small"
              style={{
                borderRadius: 12,
                border: `1px solid ${theme.contentCardBorder}`,
                background: theme.hoverBg,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text strong style={{ fontSize: 15 }}>{mem.title}</Text>
                  {mem.family_member_id && (
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      {memberMap[mem.family_member_id] || 'Member'}
                    </Text>
                  )}
                  {mem.description && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>{mem.description}</Text>
                  )}
                  <div style={{ marginTop: 8 }}>
                    {mem.date && <Tag>{mem.date}</Tag>}
                    {mem.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
                  </div>
                </div>
                <div>
                  {mem.media_url && (
                    <Button type="link" size="small" icon={<LinkOutlined />} href={mem.media_url} target="_blank" rel="noopener noreferrer" />
                  )}
                  <Button type="text" size="small" danger onClick={() => deleteMutation.mutate(mem.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal title="Add memory" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose width={480}>
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Summer reunion 2024" />
          </Form.Item>
          <Form.Item name="family_member_id" label="Related to">
            <Select
              options={members?.map((m) => ({ value: m.id, label: m.name })) || []}
              placeholder="Optional"
              allowClear
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Story or note" />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="media_url" label="Photo / media link">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="tags" label="Tags (comma-separated)">
            <Input placeholder="e.g. tradition, milestone" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Save memory
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
