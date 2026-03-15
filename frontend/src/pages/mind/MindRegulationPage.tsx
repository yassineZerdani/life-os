import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Card, Form, Input, InputNumber, DatePicker } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mindEngineService } from '../../services/mindEngine'
import { useTheme } from '../../hooks/useTheme'
import { RegulationToolkitCard } from '../../components/mind'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export function MindRegulationPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data: dashboard } = useQuery({
    queryKey: ['mind-engine', 'dashboard'],
    queryFn: () => mindEngineService.getDashboard(),
  })

  const { data: uses = [] } = useQuery({
    queryKey: ['mind-engine', 'regulation'],
    queryFn: () => mindEngineService.listRegulationUses({ days: 60, limit: 50 }),
  })

  const createUse = useMutation({
    mutationFn: (body: { tool_name: string; date: string; effectiveness_score?: number; notes?: string }) =>
      mindEngineService.createRegulationUse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind-engine'] })
      form.resetFields()
    },
  })

  const deleteUse = useMutation({
    mutationFn: (id: string) => mindEngineService.deleteRegulationUse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mind-engine'] }),
  })

  const onFinish = (v: { date: dayjs.Dayjs; tool_name: string; effectiveness_score?: number; notes?: string }) => {
    createUse.mutate({
      date: v.date.format('YYYY-MM-DD'),
      tool_name: v.tool_name,
      effectiveness_score: v.effectiveness_score,
      notes: v.notes,
    })
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/mind')} style={{ marginBottom: 16 }}>Back to Mind Engine</Button>
      <Title level={2} style={{ marginBottom: 24 }}>Regulation toolkit</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Log when you use coping or regulation tools and how helpful they are.</Text>

      <RegulationToolkitCard uses={uses} topTools={dashboard?.top_tools ?? []} onDeleteUse={(id) => deleteUse.mutate(id)} />

      <Card size="small" title="Log tool use" style={{ marginTop: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="date" label="Date" initialValue={dayjs()} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="tool_name" label="Tool name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Breathing, Walk, Journaling" />
          </Form.Item>
          <Form.Item name="effectiveness_score" label="Effectiveness (0–10)">
            <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={createUse.isPending}>Add</Button>
        </Form>
      </Card>
    </div>
  )
}
