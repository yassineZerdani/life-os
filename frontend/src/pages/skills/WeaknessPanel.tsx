/**
 * Weakness panel: list weaknesses for a skill, add new, delete.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { skillsService } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

interface WeaknessPanelProps {
  skillId: string
}

export function WeaknessPanel({ skillId }: WeaknessPanelProps) {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: weaknesses, isLoading } = useQuery({
    queryKey: ['skills', skillId, 'weaknesses'],
    queryFn: () => skillsService.listWeaknesses(skillId),
  })

  const createMutation = useMutation({
    mutationFn: (values: { weakness_name: string; severity?: string; notes?: string }) =>
      skillsService.createWeakness({
        skill_id: skillId,
        weakness_name: values.weakness_name,
        severity: values.severity || 'medium',
        notes: values.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => skillsService.deleteWeakness(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
  })

  return (
    <>
      <Card
        size="small"
        title={
          <span style={{ color: '#f59e0b' }}>
            <WarningOutlined style={{ marginRight: 8 }} />
            Weaknesses / bottlenecks
          </span>
        }
        extra={
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add
          </Button>
        }
        style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        {isLoading ? (
          <Text type="secondary">Loading...</Text>
        ) : !weaknesses?.length ? (
          <Text type="secondary" style={{ fontSize: 13 }}>No weaknesses logged. Add areas to improve.</Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weaknesses.map((w) => (
              <div
                key={w.id}
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
                  <Text strong style={{ fontSize: 13 }}>{w.weakness_name}</Text>
                  <span style={{ marginLeft: 8, fontSize: 11, color: theme.textMuted }}>{w.severity}</span>
                  {w.notes && (
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>{w.notes}</div>
                  )}
                </div>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteMutation.mutate(w.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="Add weakness / bottleneck"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <Form.Item name="weakness_name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Verb conjugation" />
          </Form.Item>
          <Form.Item name="severity" label="Severity" initialValue="medium">
            <Select options={SEVERITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
