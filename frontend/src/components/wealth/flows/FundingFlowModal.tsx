/**
 * FundingFlowModal — Add money to vault. Multi-step flow.
 * Step 1: Funding source | Step 2: Amount | Step 3: Review | Step 4: Confirm
 */
import { useState } from 'react'
import { Modal, Form, Input, InputNumber, Steps, Button, Typography } from 'antd'
import { BankOutlined, WalletOutlined } from '@ant-design/icons'
import type { WealthVault } from '../../../services/wealthVault'
import type { FundingSource } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'
import { BalanceImpactCard } from './BalanceImpactCard'

const { Text } = Typography

function FundingSourceOption({
  selected,
  onClick,
  label,
  amount,
  subtext,
  icon,
  theme,
}: {
  selected: boolean
  onClick: () => void
  label: string
  amount?: string
  subtext?: string
  icon: React.ReactNode
  theme: ReturnType<typeof useTheme>
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 12,
        border: `2px solid ${selected ? theme.accent : theme.contentCardBorder}`,
        background: theme.hoverBg,
        cursor: 'pointer',
      }}
    >
      {icon}
      <span style={{ marginLeft: 8 }} />
      <Text strong>{label}</Text>
      {amount && <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{amount}</div>}
      {subtext && <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{subtext}</Text>}
    </div>
  )
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface FundingFlowModalProps {
  open: boolean
  vault: WealthVault | null
  availableBalance: number
  fundingSources: FundingSource[]
  onConfirm: (amount: number, fundingSourceId?: string) => void
  onCancel: () => void
  loading?: boolean
}

export function FundingFlowModal({
  open,
  vault,
  availableBalance,
  fundingSources,
  onConfirm,
  onCancel,
  loading,
}: FundingFlowModalProps) {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm<{ amount: number; funding_source_id?: string }>()
  const theme = useTheme()

  const amount = Form.useWatch('amount', form) ?? 0
  const target = vault?.target_amount ?? 0
  const current = vault?.current_amount ?? 0
  const resulting = current + amount
  const remainingToTarget = target > 0 ? Math.max(0, target - resulting) : 0

  const handleNext = async () => {
    if (step < 3) {
      if (step === 1) {
        await form.validateFields(['amount'])
        setStep(2)
        return
      }
      setStep((s) => s + 1)
    } else {
      await form.validateFields()
      const values = form.getFieldsValue()
      const sourceId = values.funding_source_id === 'available' ? undefined : values.funding_source_id
      onConfirm(values.amount, sourceId)
      form.resetFields()
      setStep(0)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setStep(0)
    onCancel()
  }

  if (!vault) return null

  const steps = [
    { title: 'Source', key: 'source' },
    { title: 'Amount', key: 'amount' },
    { title: 'Review', key: 'review' },
    { title: 'Confirm', key: 'confirm' },
  ]

  return (
    <Modal
      title="Add money to vault"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Steps current={step} style={{ marginBottom: 24 }} size="small">
        {steps.map((s) => (
          <Steps.Step key={s.key} title={s.title} />
        ))}
      </Steps>

      <Form form={form} layout="vertical" initialValues={{ amount: 0, funding_source_id: 'available' }}>
        {/* Step 0: Funding source */}
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <Form.Item name="funding_source_id" hidden><Input /></Form.Item>
          <Form.Item label="Funding source">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FundingSourceOption
                selected={form.getFieldValue('funding_source_id') === 'available'}
                onClick={() => form.setFieldValue('funding_source_id', 'available')}
                label="Available balance"
                amount={formatMoney(availableBalance)}
                subtext="Instant · No fee"
                icon={<WalletOutlined />}
                theme={theme}
              />
              {fundingSources.map((fs) => (
                <FundingSourceOption
                  key={fs.id}
                  selected={form.getFieldValue('funding_source_id') === fs.id}
                  onClick={() => form.setFieldValue('funding_source_id', fs.id)}
                  label={fs.label + (fs.last4 ? ` •••• ${fs.last4}` : '')}
                  icon={<BankOutlined />}
                  theme={theme}
                />
              ))}
            </div>
          </Form.Item>
        </div>

        {/* Step 1: Amount */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Enter amount' },
              { type: 'number', min: 0.01, message: 'Minimum $0.01' },
              { type: 'number', max: availableBalance, message: `Maximum ${formatMoney(availableBalance)}` },
            ]}
          >
            <InputNumber
              min={0.01}
              max={availableBalance}
              step={10}
              prefix="$"
              size="large"
              style={{ width: '100%' }}
              placeholder="Enter amount"
            />
          </Form.Item>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Current vault balance</Text>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{formatMoney(current)}</div>
          </div>
          {target > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Target</Text>
              <div style={{ fontSize: 16 }}>{formatMoney(target)}</div>
              {amount > 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatMoney(remainingToTarget)} remaining after this transfer
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Review */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <div style={{ padding: 16, background: theme.hoverBg, borderRadius: 12, marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Vault</Text>
            <div style={{ fontWeight: 600 }}>{vault.name}</div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Amount</Text>
              <Text strong>{formatMoney(amount)}</Text>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Fee</Text>
              <Text>$0.00</Text>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${theme.contentCardBorder}` }}>
              <Text type="secondary">Net amount</Text>
              <Text strong>{formatMoney(amount)}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
              Estimated arrival: Instant. Funds will be available in the vault immediately.
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              You will need to lock the vault manually after funding to secure the funds until the unlock date.
            </Text>
          </div>
          <BalanceImpactCard
            label="Vault balance"
            currentAmount={current}
            changeAmount={amount}
            resultingAmount={resulting}
          />
        </div>

        {/* Step 3: Confirm */}
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Review the details above. Click Confirm to add {formatMoney(amount)} to {vault.name}.
          </Text>
        </div>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button type="primary" onClick={handleNext} loading={loading}>
          {step === 3 ? 'Confirm funding' : 'Next'}
        </Button>
      </div>
    </Modal>
  )
}
