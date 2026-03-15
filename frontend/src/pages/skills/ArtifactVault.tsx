/**
 * Artifact vault component: list artifacts for a skill, add new.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

const ARTIFACT_TYPES = [
  { value: 'code', label: 'Code' },
  { value: 'design', label: 'Design' },
  { value: 'essay', label: 'Essay' },
  { value: 'recording', label: 'Recording' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'note', label: 'Note' },
]

interface ArtifactVaultProps {
  skillId: string
}

export function ArtifactVault({ skillId }: ArtifactVaultProps) {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ['skills', skillId, 'artifacts'],
    queryFn: () => skillsService.listArtifacts(skillId),
  })

  const createMutation = useMutation({
    mutationFn: (values: { type: string; title: string; description?: string; link_url?: string; file_url?: string }) =>
      skillsService.createArtifact({
        skill_id: skillId,
        type: values.type,
        title: values.title,
        description: values.description,
        link_url: values.link_url,
        file_url: values.file_url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => skillsService.deleteArtifact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  })

  return (
    <>
      <Card
        size="small"
        title="Proof / Artifacts"
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add
          </Button>
        }
        style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        {isLoading ? (
          <Text type="secondary">Loading...</Text>
        ) : !artifacts?.length ? (
          <Text type="secondary" style={{ fontSize: 13 }}>No artifacts yet. Add a link or file as proof of progress.</Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {artifacts.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 8,
                  background: theme.hoverBg,
                }}
              >
                <div>
                  <Text strong style={{ fontSize: 13 }}>{a.title}</Text>
                  <span style={{ marginLeft: 8, fontSize: 12, color: theme.textMuted }}>{a.type}</span>
                </div>
                <div>
                  {(a.link_url || a.file_url) && (
                    <Button
                      type="link"
                      size="small"
                      icon={<LinkOutlined />}
                      href={a.link_url || a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteMutation.mutate(a.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="Add artifact"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
        >
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={ARTIFACT_TYPES} placeholder="Select type" />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Portfolio project" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="link_url" label="Link URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="file_url" label="File URL">
            <Input placeholder="https://... or path" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Add artifact
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
