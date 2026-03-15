import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Card, Form, Input, InputNumber, DatePicker } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mindEngineService } from '../../services/mindEngine'
import { useTheme } from '../../hooks/useTheme'
import { TriggerLoopMap, ThoughtPatternPanel } from '../../components/mind'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export function MindLoopsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loopForm] = Form.useForm()
  const [patternForm] = Form.useForm()
  const [triggerForm] = Form.useForm()

  const { data: triggers = [] } = useQuery({
    queryKey: ['mind-engine', 'triggers'],
    queryFn: () => mindEngineService.listTriggers({ days: 60, limit: 50 }),
  })

  const { data: loops = [] } = useQuery({
    queryKey: ['mind-engine', 'loops'],
    queryFn: () => mindEngineService.listLoops(),
  })

  const { data: patterns = [] } = useQuery({
    queryKey: ['mind-engine', 'thought-patterns'],
    queryFn: () => mindEngineService.listThoughtPatterns(),
  })

  const createLoop = useMutation({
    mutationFn: (body: Parameters<typeof mindEngineService.createLoop>[0]) => mindEngineService.createLoop(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mind-engine'] }); loopForm.resetFields(); },
  })

  const createPattern = useMutation({
    mutationFn: (body: Parameters<typeof mindEngineService.createThoughtPattern>[0]) => mindEngineService.createThoughtPattern(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mind-engine'] }); patternForm.resetFields(); },
  })

  const createTrigger = useMutation({
    mutationFn: (body: Parameters<typeof mindEngineService.createTrigger>[0]) => mindEngineService.createTrigger(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mind-engine'] }); triggerForm.resetFields(); },
  })

  const deletePattern = useMutation({
    mutationFn: (id: string) => mindEngineService.deleteThoughtPattern(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mind-engine'] }),
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/mind')} style={{ marginBottom: 16 }}>Back to Mind Engine</Button>
      <Title level={2} style={{ marginBottom: 24 }}>Loops and patterns</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Map trigger-to-behavior loops and track recurring thought patterns.</Text>

      <TriggerLoopMap triggers={triggers} loops={loops} />

      <Card size="small" title="Log trigger" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Form form={triggerForm} layout="vertical" onFinish={(v) => createTrigger.mutate({ date: v.date.format('YYYY-MM-DD'), trigger_type: v.trigger_type, description: v.description, linked_emotion: v.linked_emotion, linked_behavior: v.linked_behavior })}>
          <Form.Item name="date" label="Date" initialValue={dayjs()} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="trigger_type" label="Trigger type" rules={[{ required: true }]}><Input placeholder="e.g. conflict, lack of sleep" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="linked_emotion" label="Linked emotion"><Input placeholder="Emotion that followed" /></Form.Item>
          <Form.Item name="linked_behavior" label="Linked behavior"><Input placeholder="What you did" /></Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createTrigger.isPending}>Log trigger</Button>
        </Form>
      </Card>

      <Card size="small" title="Add behavior loop" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Form form={loopForm} layout="vertical" onFinish={(v) => createLoop.mutate({ title: v.title, trigger_summary: v.trigger_summary, emotional_sequence: v.emotional_sequence, behavioral_sequence: v.behavioral_sequence, aftermath: v.aftermath })}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g. Conflict then withdrawal" /></Form.Item>
          <Form.Item name="trigger_summary" label="Trigger"><Input placeholder="What typically starts it" /></Form.Item>
          <Form.Item name="emotional_sequence" label="Emotional sequence"><Input placeholder="Emotions that follow" /></Form.Item>
          <Form.Item name="behavioral_sequence" label="Behavioral sequence"><Input placeholder="What you do" /></Form.Item>
          <Form.Item name="aftermath" label="Aftermath"><Input placeholder="How it usually ends" /></Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createLoop.isPending}>Add loop</Button>
        </Form>
      </Card>

      <div style={{ marginTop: 24 }}>
        <ThoughtPatternPanel patterns={patterns} onDelete={(id) => deletePattern.mutate(id)} />
      </div>

      <Card size="small" title="Add thought pattern" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Form form={patternForm} layout="vertical" onFinish={(v) => createPattern.mutate({ title: v.title, description: v.description, frequency_score: v.frequency_score, severity_score: v.severity_score })}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="Recurring thought or theme" /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="frequency_score" label="Frequency (0-10)"><InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="severity_score" label="Severity (0-10)"><InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} /></Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createPattern.isPending}>Add pattern</Button>
        </Form>
      </Card>
    </div>
  )
}
