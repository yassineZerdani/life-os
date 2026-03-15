import { Table, Typography } from 'antd'
import dayjs from 'dayjs'
import type { VaultTransaction } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

const TYPE_LABELS: Record<string, string> = {
  fund: 'Fund',
  lock: 'Lock',
  add_funds: 'Add funds',
  unlock: 'Unlock',
  payout: 'Payout',
  break_early: 'Break early',
  reverse: 'Reverse',
  fee: 'Fee',
}

export function VaultTransactionTable({ transactions }: { transactions: VaultTransaction[] }) {
  const theme = useTheme()

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => <Text style={{ fontSize: 13 }}>{dayjs(v).format('MMM D, YYYY HH:mm')}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (v: string) => <Text>{TYPE_LABELS[v] ?? v}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number, r: VaultTransaction) => (
        <Text strong style={{ color: ['add_funds', 'fund'].includes(r.transaction_type) ? '#22c55e' : theme.textPrimary }}>
          ${v.toLocaleString('en-US', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Text type="secondary">{v}</Text>,
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (v: string) => v ? <Text type="secondary">{v}</Text> : '—' },
  ]

  return (
    <Table
      dataSource={transactions}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      size="small"
    />
  )
}
