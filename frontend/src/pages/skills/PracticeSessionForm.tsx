/**
 * Log a practice session: duration, difficulty, focus area, mistakes, feedback, quality.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Modal, Form, InputNumber, Input, Select, DatePicker } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useState } from 'react'
import dayjs from 'dayjs'
import { skillsService } from '../../services/skills'

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'challenge', label: 'Challenge' },
]

const ENERGY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface PracticeSessionFormProps {
  skillId: string
  skillName: string
}

export function PracticeSessionForm({ skillId, skillName }: PracticeSessionFormProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const mutation = useMutation({
    mutationFn: (values: {
      date: string
      duration_minutes: number
      difficulty?: string
      focus_area?: string
      mistakes_notes?: string
      feedback_notes?: string
      energy_level?: string
      quality_score?: number
    }) =>
      skillsService.createSession({
        skill_id: skillId,
        date: values.date,
        duration_minutes: values.duration_minutes,
        difficulty: values.difficulty,
        focus_area: values.focus_area,
        mistakes_notes: values.mistakes_notes,
        feedback_notes: values.feedback_notes,
        energy_level: values.energy_level,
        quality_score: values.quality_score,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setOpen(false)
      form.resetFields()
    },
  })

  return (
    <>
      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={() => setOpen(true)}
        style={{ borderRadius: 10 }}
      >
        Log practice
      </Button>
      <Modal
        title={`Log practice: ${skillName}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs(),
            duration_minutes: 30,
          }}
          onFinish={(v) =>
            mutation.mutate({
              date: dayjs(v.date).format('YYYY-MM-DD'),
              duration_minutes: v.duration_minutes,
              difficulty: v.difficulty,
              focus_area: v.focus_area,
              mistakes_notes: v.mistakes_notes,
              feedback_notes: v.feedback_notes,
              energy_level: v.energy_level,
              quality_score: v.quality_score,
            })
          }
        >
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration_minutes" label="Duration (minutes)" rules={[{ required: true }]}>
            <InputNumber min={1} max={480} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="difficulty" label="Difficulty">
            <Select options={DIFFICULTY_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <Form.Item name="focus_area" label="Focus area">
            <Input placeholder="e.g. pronunciation, APIs" />
          </Form.Item>
          <Form.Item name="mistakes_notes" label="Mistakes / notes">
            <Input.TextArea rows={2} placeholder="What went wrong or what to improve" />
          </Form.Item>
          <Form.Item name="feedback_notes" label="Feedback">
            <Input.TextArea rows={2} placeholder="External or self feedback" />
          </Form.Item>
          <Form.Item name="energy_level" label="Energy level">
            <Select options={ENERGY_OPTIONS} placeholder="Optional" allowClear />
          </Form.Item>
          <Form.Item name="quality_score" label="Quality (0–1)">
            <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} placeholder="Optional" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
              Save session
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
