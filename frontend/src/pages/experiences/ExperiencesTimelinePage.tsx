/**
 * Experience timeline — full chronological list with add.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { lifeMemoryService } from '../../services/lifeMemory'
import { useTheme } from '../../hooks/useTheme'
import { ExperienceTimeline } from '../../components/experiences'

const { Title, Text } = Typography

const CATEGORY_OPTIONS = [
  { value: 'travel', label: 'Travel' },
  { value: 'creative', label: 'Creative' },
  { value: 'social', label: 'Social' },
  { value: 'reflective', label: 'Reflective' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'learning', label: 'Learning' },
  { value: 'nature', label: 'Nature' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'other', label: 'Other' },
]

const TONE_OPTIONS = [
  { value: 'joyful', label: 'Joyful' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'intense', label: 'Intense' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'transformative', label: 'Transformative' },
  { value: 'bittersweet', label: 'Bittersweet' },
  { value: 'other', label: 'Other' },
]

export function ExperiencesTimelinePage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['life-memory', 'timeline'],
    queryFn: () => lifeMemoryService.getTimeline({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      lifeMemoryService.createExperience({
        title: values.title as string,
        description: values.description as string,
        date: dayjs(values.date as string).format('YYYY-MM-DD'),
        location_name: values.location_name as string,
        latitude: values.latitude != null ? Number(values.latitude) : undefined,
        longitude: values.longitude != null ? Number(values.longitude) : undefined,
        category: values.category as string,
        emotional_tone: values.emotional_tone as string,
        intensity_score: values.intensity_score != null ? Number(values.intensity_score) : undefined,
        meaning_score: values.meaning_score != null ? Number(values.meaning_score) : undefined,
        aliveness_score: values.aliveness_score != null ? Number(values.aliveness_score) : undefined,
        lesson_note: values.lesson_note as string,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-memory'] })
      setModalOpen(false)
      form.resetFields()
    },
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Experience timeline
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            What happened, where, who was there, and what it meant
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ borderRadius: 10 }}>
          Log experience
        </Button>
      </div>

      <ExperienceTimeline
        items={timeline ?? []}
        loading={isLoading}
      />

      <Modal
        title="Log experience"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs().format('YYYY-MM-DD') }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Short title" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={CATEGORY_OPTIONS} placeholder="Select" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="What happened?" />
          </Form.Item>
          <Form.Item name="location_name" label="Location name">
            <Input placeholder="e.g. Paris, France" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="latitude" label="Latitude">
              <InputNumber style={{ width: '100%' }} placeholder="Optional" step={0.0001} />
            </Form.Item>
            <Form.Item name="longitude" label="Longitude">
              <InputNumber style={{ width: '100%' }} placeholder="Optional" step={0.0001} />
            </Form.Item>
          </div>
          <Form.Item name="emotional_tone" label="Emotional tone">
            <Select options={TONE_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Form.Item name="intensity_score" label="Intensity (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="meaning_score" label="Meaning (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="aliveness_score" label="Aliveness (0–10)">
              <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="lesson_note" label="Lesson learned">
            <Input.TextArea rows={2} placeholder="Optional" />
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
