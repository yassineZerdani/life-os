import { useState } from 'react'
import { Card, Form, Input, Select, DatePicker, Button, Table, message } from 'antd'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { timeBlocksService } from '../services/timeBlocks'
import { domainsService } from '../services/domains'
import dayjs from 'dayjs'

const { TextArea } = Input
const { RangePicker } = DatePicker

export function TimeTrackingPage() {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ])

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: domainsService.list,
  })

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['time-blocks', dateRange?.[0]?.format('YYYY-MM-DD'), dateRange?.[1]?.format('YYYY-MM-DD')],
    queryFn: () =>
      timeBlocksService.list({
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
      }),
    enabled: !!dateRange?.[0] && !!dateRange?.[1],
  })

  const mutation = useMutation({
    mutationFn: (values: { domain: string; title: string; start_time: string; end_time: string; notes?: string }) =>
      timeBlocksService.create(values),
    onSuccess: () => {
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      message.success('Time block logged!')
    },
    onError: (e: Error) => message.error(e.message),
  })

  return (
    <div>
      <h1 className="app-page-title" style={{ marginBottom: 24, fontSize: 28 }}>Time Tracking</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        <Card title="Log Activity">
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => {
              const [start, end] = v.time_range
              mutation.mutate({
                domain: v.domain,
                title: v.title,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                notes: v.notes,
              })
            }}
          >
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input placeholder="e.g. Gym session" />
            </Form.Item>
            <Form.Item name="domain" label="Domain" rules={[{ required: true }]}>
              <Select
                placeholder="Select domain"
                options={domains?.map((d: { id: number; name: string; slug: string }) => ({
                  label: d.name,
                  value: d.slug,
                }))}
              />
            </Form.Item>
            <Form.Item name="time_range" label="Start & End Time" rules={[{ required: true }]}>
              <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={3} placeholder="Optional notes" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                Log Time
              </Button>
            </Form.Item>
          </Form>
        </Card>
        <Card title="Recent Time Blocks">
          <div style={{ marginBottom: 16 }}>
            <label style={{ marginRight: 8 }}>Date range:</label>
            <RangePicker
              value={dateRange}
              onChange={(v) => v && setDateRange([v[0]!, v[1]!])}
              format="YYYY-MM-DD"
            />
          </div>
          <Table
            size="small"
            loading={isLoading}
            dataSource={blocks || []}
            rowKey="id"
            columns={[
              { title: 'Title', dataIndex: 'title', key: 'title' },
              { title: 'Domain', dataIndex: 'domain', key: 'domain', width: 100 },
              {
                title: 'Duration',
                key: 'duration',
                width: 80,
                render: (_, r) => `${Math.round(r.duration_minutes / 60 * 10) / 10}h`,
              },
            ]}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  )
}
