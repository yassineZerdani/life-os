import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Card, Form, Input, InputNumber, DatePicker } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mindEngineService } from '../../services/mindEngine'
import { useTheme } from '../../hooks/useTheme'
import { EmotionalWeatherChart } from '../../components/mind'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export function MindEmotionsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['mind-engine', 'dashboard'],
    queryFn: () => mindEngineService.getDashboard({ weather_days: 14 }),
  })
  const { data: emotions = [] } = useQuery({
    queryKey: ['mind-engine', 'emotions'],
    queryFn: () => mindEngineService.listEmotions({ days: 30, limit: 50 }),
  })

  const createEmotion = useMutation({
    mutationFn: (body: { date: string; primary_emotion: string; intensity?: number; notes?: string }) =>
      mindEngineService.createEmotion(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mind-engine'] }); form.resetFields(); },
  })
  const deleteEmotion = useMutation({
    mutationFn: (id: string) => mindEngineService.deleteEmotion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mind-engine'] }),
  })

  const onFinish = (v: { date: dayjs.Dayjs; primary_emotion: string; intensity?: number; notes?: string }) => {
    createEmotion.mutate({
      date: v.date.format('YYYY-MM-DD'),
      primary_emotion: v.primary_emotion,
      intensity: v.intensity,
      notes: v.notes,
    })
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/mind')} style={{ marginBottom: 16 }}>Back to Mind Engine</Button>
      <Title level={2} style={{ marginBottom: 24 }}>Emotions</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Log your emotional weather.</Text>

      <Card size="small" title="Log emotion" style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="date" label="Date" initialValue={dayjs()} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="primary_emotion" label="Primary emotion" rules={[{ required: true }]}>
            <Input placeholder="e.g. calm, anxious, sad, happy" />
          </Form.Item>
          <Form.Item name="intensity" label="Intensity (0-10)">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createEmotion.isPending}>Add</Button>
        </Form>
      </Card>

      <EmotionalWeatherChart data={dashboard?.emotional_weather ?? []} loading={isLoading} />

      <Card size="small" title="Recent entries" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {emotions.slice(0, 20).map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <span><strong>{e.primary_emotion}</strong> - {e.date}{e.intensity != null ? ` - ${e.intensity}/10` : ''}</span>
              <Button type="text" size="small" danger onClick={() => deleteEmotion.mutate(e.id)}>Remove</Button>
            </div>
          ))}
          {emotions.length === 0 && <Text type="secondary">No entries yet</Text>}
        </div>
      </Card>
    </div>
  )
}
