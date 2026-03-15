/**
 * PayoutFlowModal — Send unlocked funds to destination.
 * Step 1: Destination | Step 2: Review | Step 3: Confirm
 */
import { useState } from 'react'
import { Modal, Steps, Button, Typography } from 'antd'
import { WalletOutlined, BankOutlined } from '@ant-design/icons'
import type { WealthVault } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

type PayoutDestination = 'available' | 'bank'

interface PayoutFlowModalProps {
  open: boolean
  vault: WealthVault | null
  amount: number
  onConfirm: (destination: PayoutDestination) => void
  onCancel: () => void
  loading?: boolean
}

export function PayoutFlowModal({ open, vault, amount, onConfirm, onCancel, loading }: PayoutFlowModalProps) {
  const [step, setStep] = useState(0)
  const [destination, setDestination] = useState<PayoutDestination>('available')
  const theme = useTheme()

  const handleClose = () => {
    setStep(0)
    setDestination('available')
    onCancel()
  }

  const handleConfirm = () => {
    onConfirm(destination)
    setStep(0)
  }

  if (!vault) return null

  return (
    <Modal
      title="Payout unlocked funds"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
    >
      <Steps current={step} style={{ marginBottom: 24 }} size="small">
        <Steps.Step title="Destination" />
        <Steps.Step title="Review" />
        <Steps.Step title="Confirm" />
      </Steps>

      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            onClick={() => setDestination('available')}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${destination === 'available' ? theme.accent : theme.contentCardBorder}`,
              background: theme.hoverBg,
              cursor: 'pointer',
            }}
          >
            <WalletOutlined style={{ marginRight: 8 }} />
            <Text strong>Available balance</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Funds stay in your wealth account</Text>
          </div>
          <div
            onClick={() => setDestination('bank')}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `2px solid ${destination === 'bank' ? theme.accent : theme.contentCardBorder}`,
              background: theme.hoverBg,
              cursor: 'pointer',
            }}
          >
            <BankOutlined style={{ marginRight: 8 }} />
            <Text strong>Linked bank account</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>1–3 business days (Phase 2)</Text>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ padding: 16, background: theme.hoverBg, borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Payout details</Text>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">Vault</Text>
              <Text>{vault.name}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text type="secondary">Amount</Text>
              <Text strong>{formatMoney(amount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Destination</Text>
              <Text>{destination === 'available' ? 'Available balance' : 'Linked bank account'}</Text>
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 16 }}>
            Review payout details before confirming.
          </Text>
        </div>
      )}

      {step === 2 && (
        <Text type="secondary">
          Confirm to send {formatMoney(amount)} to your {destination === 'available' ? 'available balance' : 'bank account'}.
        </Text>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button type="primary" onClick={step < 2 ? () => setStep((s) => s + 1) : handleConfirm} loading={loading}>
          {step === 2 ? 'Confirm payout' : 'Next'}
        </Button>
      </div>
    </Modal>
  )
}
