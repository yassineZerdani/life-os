/**
 * Wealth Dashboard — Net Worth, 50/30/20 Budget, Money Vaults, Investment Portfolio.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Progress, Row, Col, Button, InputNumber, Form, Modal, Input, DatePicker, Select, Tag } from 'antd'
import { DollarOutlined, PlusOutlined, LockOutlined, PieChartOutlined, SafetyOutlined, BankOutlined } from '@ant-design/icons'
import { wealthService } from '../services/wealth'
import { useTheme } from '../hooks/useTheme'
import { useState } from 'react'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const CATEGORY_COLORS = { needs: '#22c55e', wants: '#eab308', savings: '#6366f1' }

export function WealthPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [vaultModalOpen, setVaultModalOpen] = useState(false)
  const [addToVaultId, setAddToVaultId] = useState<string | null>(null)

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['wealth', 'dashboard'],
    queryFn: () => wealthService.getDashboard(),
  })

  const incomeMutation = useMutation({
    mutationFn: (values: { amount: number; notes?: string }) =>
      wealthService.createIncomeEntry({ amount: values.amount, notes: values.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setIncomeModalOpen(false)
    },
  })

  const expenseMutation = useMutation({
    mutationFn: (values: { amount: number; category: string; description?: string }) =>
      wealthService.createExpense({ amount: values.amount, category: values.category, description: values.description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setExpenseModalOpen(false)
    },
  })

  const vaultMutation = useMutation({
    mutationFn: (values: { name: string; target_amount: number; unlock_date: string; description?: string }) =>
      wealthService.createVault({
        name: values.name,
        target_amount: values.target_amount,
        unlock_date: values.unlock_date,
        description: values.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setVaultModalOpen(false)
    },
  })

  const addToVaultMutation = useMutation({
    mutationFn: ({ vaultId, amount }: { vaultId: string; amount: number }) =>
      wealthService.addToVault(vaultId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setAddToVaultId(null)
    },
  })

  if (isLoading || !dashboard) {
    return <div style={{ padding: 24 }}>Loading wealth dashboard...</div>
  }

  const { net_worth, total_income_this_month, budget_distribution, vaults, investment_accounts, active_strategy } = dashboard

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DollarOutlined style={{ marginRight: 8 }} />
          Wealth
        </Title>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIncomeModalOpen(true)}>
            Add Income
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => setExpenseModalOpen(true)}>
            Add Expense
          </Button>
          <Button icon={<LockOutlined />} onClick={() => setVaultModalOpen(true)}>
            New Savings Vault
          </Button>
          <Button icon={<SafetyOutlined />} onClick={() => navigate('/app/wealth/vaults')}>
            Money Vaults
          </Button>
          <Button icon={<BankOutlined />} onClick={() => navigate('/app/wealth/accounts')}>
            Account
          </Button>
        </div>
      </div>

      {/* Net Worth */}
      <Card style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Net Worth</Text>
        <Title level={2} style={{ margin: '8px 0 0', color: net_worth != null && net_worth >= 0 ? theme.textPrimary : '#ef4444' }}>
          {net_worth != null ? `$${Number(net_worth).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
        </Title>
        {total_income_this_month != null && (
          <Text type="secondary" style={{ fontSize: 13 }}>Income this month: ${Number(total_income_this_month).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        )}
      </Card>

      {/* Budget 50/30/20 */}
      <Card
        title={
          <span>
            <PieChartOutlined style={{ marginRight: 8 }} />
            Budget (50/30/20)
          </span>
        }
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        <Row gutter={[16, 16]}>
          {budget_distribution.map((d) => (
            <Col xs={24} sm={8} key={d.category_key}>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{d.label}</Text>
                  {d.is_over && <Tag color="error">Over</Tag>}
                </div>
                <Progress
                  percent={Math.min(d.spent_percentage, 100)}
                  strokeColor={CATEGORY_COLORS[d.category_key as keyof typeof CATEGORY_COLORS] || theme.accent}
                  showInfo={true}
                  format={() => `${d.spent_percentage}% / ${d.target_percentage}%`}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ${Number(d.spent_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} spent
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Money Vaults (new system) + Legacy Savings Vaults */}
      <Card
        title={
          <span>
            <LockOutlined style={{ marginRight: 8 }} />
            Savings & Vaults
          </span>
        }
        extra={<Button type="link" size="small" onClick={() => navigate('/app/wealth/vaults')}>Money Vaults →</Button>}
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        {vaults.length === 0 ? (
          <Text type="secondary">No vaults yet. Create one to lock savings until a date.</Text>
        ) : (
          <Row gutter={[16, 16]}>
            {vaults.map((v) => {
              const pct = v.target_amount > 0 ? Math.min(100, (v.current_amount / v.target_amount) * 100) : 0
              const unlocked = dayjs(v.unlock_date).isBefore(dayjs())
              return (
                <Col xs={24} md={12} key={v.id}>
                  <Card size="small" style={{ borderLeft: `4px solid ${theme.accent}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Text strong>{v.name}</Text>
                        {v.description && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>{v.description}</Text>
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Text>
                            ${Number(v.current_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} / $
                            {Number(v.target_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Unlocks {dayjs(v.unlock_date).format('MMM D, YYYY')} {unlocked && '(unlocked)'}
                        </Text>
                        {!unlocked && (
                          <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, marginTop: 4 }}
                            onClick={() => setAddToVaultId(v.id)}
                          >
                            Add money
                          </Button>
                        )}
                      </div>
                      <Progress type="circle" percent={Math.round(pct)} size={56} />
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        )}
      </Card>

      {/* Investment Portfolio */}
      <Card
        title="Investment Portfolio"
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        {active_strategy && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Active strategy: </Text>
            <Tag color="blue">{active_strategy.label || active_strategy.name}</Tag>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {active_strategy.allocations?.map((a) => (
                <Tag key={a.allocation_key}>{a.label || a.allocation_key}: {a.percentage}%</Tag>
              ))}
            </div>
          </div>
        )}
        {investment_accounts.length === 0 ? (
          <Text type="secondary">No investment accounts. Create one and set an active strategy to auto-allocate savings.</Text>
        ) : (
          <Row gutter={[16, 16]}>
            {investment_accounts.map((a) => (
              <Col xs={24} sm={12} md={8} key={a.id}>
                <Card size="small">
                  <Text strong>{a.name}</Text>
                  {a.account_type && <Tag style={{ marginLeft: 8 }}>{a.account_type}</Tag>}
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: 600 }}>
                      ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Add Income Modal */}
      <Modal
        title="Add Income"
        open={incomeModalOpen}
        onCancel={() => setIncomeModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(v) => incomeMutation.mutate({ amount: v.amount, notes: v.notes })}
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={100} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={incomeMutation.isPending}>
              Add & Run 50/30/20
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        title="Add Expense"
        open={expenseModalOpen}
        onCancel={() => setExpenseModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(v) => expenseMutation.mutate({
            amount: v.amount,
            category: v.category,
            description: v.description,
          })}
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={10} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'needs', label: 'Needs (50%)' },
                { value: 'wants', label: 'Wants (30%)' },
                { value: 'savings', label: 'Savings (20%)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={expenseMutation.isPending}>
              Add Expense
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* New Vault Modal */}
      <Modal
        title="New Money Vault"
        open={vaultModalOpen}
        onCancel={() => setVaultModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(v) => vaultMutation.mutate({
            name: v.name,
            target_amount: v.target_amount,
            unlock_date: v.unlock_date?.format('YYYY-MM-DD') || dayjs().add(1, 'year').format('YYYY-MM-DD'),
            description: v.description,
          })}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Emergency fund" />
          </Form.Item>
          <Form.Item name="target_amount" label="Target amount" rules={[{ required: true }]}>
            <InputNumber min={1} step={100} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="unlock_date" label="Unlock date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={vaultMutation.isPending}>
              Create Vault
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add to Vault Modal */}
      <Modal
        title="Add money to vault"
        open={!!addToVaultId}
        onCancel={() => setAddToVaultId(null)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(v) => addToVaultId && addToVaultMutation.mutate({ vaultId: addToVaultId, amount: v.amount })}
        >
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber min={0.01} step={50} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={addToVaultMutation.isPending}>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
