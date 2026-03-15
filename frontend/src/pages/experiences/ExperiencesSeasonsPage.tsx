/**
 * Seasons of life — chapters with start/end and summary.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { lifeMemoryService } from '../../services/lifeMemory'
import { useTheme } from '../../hooks/useTheme'
import { SeasonOfLifeCard } from '../../components/experiences'

const { Title, Text } = Typography

export function ExperiencesSeasonsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: seasons, isLoading } = useQuery({
    queryKey: ['life-memory', 'seasons'],
    queryFn: () => lifeMemoryService.listSeasons(),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      lifeMemoryService.createSeason({
        title: values.title as string,
        start_date: dayjs(values.start_date as string).format('YYYY-MM-DD'),
        end_date: values.end_date ? dayjs(values.end_date as string).format('YYYY-MM-DD') : undefined,
        summary: values.summary as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-memory'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Seasons of life
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Chapters and phases — start, end, and what they meant
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
          Add season
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, color: theme.textMuted }}>Loading seasons…</div>
      ) : (seasons ?? []).length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">No seasons yet. Define chapters of your life with a title and date range.</Text>
          <div style={{ marginTop: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
              Add first season
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(seasons ?? []).map((s) => (
            <SeasonOfLifeCard key={s.id} season={s} />
          ))}
        </div>
      )}

      <Modal
        title="Add season"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. College years" />
          </Form.Item>
          <Form.Item name="start_date" label="Start date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="end_date" label="End date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="summary" label="Summary">
            <Input.TextArea rows={3} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} style={{ borderRadius: 10 }}>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
