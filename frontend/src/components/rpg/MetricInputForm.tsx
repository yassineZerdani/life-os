import { useState } from 'react'
import { Form, InputNumber, Input, Button, Select, Card } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { metricsService } from '../../services/metrics'
import type { Metric } from '../../types'
import dayjs from 'dayjs'

interface MetricInputFormProps {
  metrics: Metric[]
  onSuccess?: () => void
}

export function MetricInputForm({ metrics, onSuccess }: MetricInputFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)

  const mutation = useMutation({
    mutationFn: (values: { metric_id: string; value: number; note?: string }) =>
      metricsService.addEntry({
        ...values,
        timestamp: dayjs().toISOString(),
      }),
    onSuccess: () => {
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onSuccess?.()
    },
  })

  const metricOptions = metrics.map((m) => ({
    label: `${m.name} (${m.unit})`,
    value: m.id,
  }))

  return (
    <Card title="Log Metric" size="small">
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) => mutation.mutate({ metric_id: v.metric_id, value: v.value, note: v.note })}
      >
        <Form.Item name="metric_id" label="Metric" rules={[{ required: true }]}>
          <Select
            placeholder="Select metric"
            options={metricOptions}
            onChange={(id) => setSelectedMetric(metrics.find((m) => m.id === id) ?? null)}
          />
        </Form.Item>
        <Form.Item name="value" label="Value" rules={[{ required: true }]}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder={selectedMetric ? `Enter value in ${selectedMetric.unit}` : 'Value'}
          />
        </Form.Item>
        <Form.Item name="note" label="Note">
          <Input.TextArea rows={2} placeholder="Optional note" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Log
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
