/**
 * Wealth accounts — available, locked, pending balance. Add funds.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Button, Modal, Form, InputNumber } from 'antd'
import { wealthVaultService } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { WealthAccountSummary } from '../../components/wealth/WealthAccountSummary'
import { BalanceDistributionCard } from '../../components/wealth/BalanceDistributionCard'

const { Title, Text } = Typography

export function WealthAccountsPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form] = Form.useForm<{ amount: number }>()

  const { data: accounts = [] } = useQuery({
    queryKey: ['wealth', 'accounts'],
    queryFn: () => wealthVaultService.listAccounts(),
  })
  const account = accounts[0]

  const addMutation = useMutation({
    mutationFn: (amount: number) => wealthVaultService.addFunds({ amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setAddModalOpen(false)
      form.resetFields()
    },
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: theme.textPrimary }}>Wealth Account</Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Your wallet balance. Add funds to create vaults and lock savings.
        </Text>
      </div>

      <WealthAccountSummary account={account} onAddFunds={() => setAddModalOpen(true)} />
      {account && (
        <div style={{ marginTop: 24 }}>
          <BalanceDistributionCard
            available={account.available_balance}
            locked={account.locked_balance}
            pending={account.pending_balance}
          />
        </div>
      )}

      <Modal
        title="Add funds"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => addMutation.mutate(v.amount)}
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={100} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={addMutation.isPending}>
              Add funds
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
