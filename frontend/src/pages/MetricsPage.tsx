import { useQuery } from '@tanstack/react-query'
import { Card, Table, Typography, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { metricsService } from '../services/metrics'
import { useAppStore } from '../store/useAppStore'
import dayjs from 'dayjs'
import type { Metric, MetricEntry } from '../types'

const { Text } = Typography

export function MetricsPage() {
  const domains = useAppStore((s) => s.domains)
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsService.list(),
  })

  const getDomainName = (slug: string) => domains.find((d) => d.slug === slug)?.name || slug

  const columns: ColumnsType<Metric> = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v) => <Text strong>{v}</Text> },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (slug) => getDomainName(slug),
    },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>Metrics</h1>
      <Card>
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={metrics || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="No metrics" /> }}
          expandable={{
            expandedRowRender: (record) => <MetricEntriesRow metricId={record.id} />,
          }}
        />
      </Card>
    </div>
  )
}

function MetricEntriesRow({ metricId }: { metricId: string }) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['metric-entries', metricId],
    queryFn: () => metricsService.getEntries(metricId, 20),
  })

  const cols: ColumnsType<MetricEntry> = [
    { title: 'Value', dataIndex: 'value', key: 'value' },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (v) => dayjs(v).format('MMM D, YYYY HH:mm'),
    },
  ]

  return (
    <Table
      size="small"
      loading={isLoading}
      columns={cols}
      dataSource={entries || []}
      rowKey="id"
      pagination={false}
    />
  )
}
