/**
 * Create Vault Modal — step-based flow. Clean, trustworthy.
 * Step 1: Basics | Step 2: Lock settings | Step 3: Funding | Step 4: Review
 */
import { useState } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Switch, Select, Button, Steps, Typography } from 'antd'
import dayjs from 'dayjs'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export interface CreateVaultFormValues {
  name: string
  description?: string
  vault_category?: string
  target_amount?: number
  unlock_date: dayjs.Dayjs
  vault_type: 'soft' | 'real'
  break_early_allowed: boolean
  break_early_penalty_type?: string
  break_early_penalty_value?: number
  auto_unlock: boolean
  initial_amount?: number
}

interface CreateVaultModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: CreateVaultFormValues) => void
  loading?: boolean
}

const STEPS = [
  { title: 'Basics', key: 'basics' },
  { title: 'Lock settings', key: 'lock' },
  { title: 'Funding', key: 'funding' },
  { title: 'Review', key: 'review' },
]

const CATEGORIES = [
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'tax', label: 'Tax Reserve' },
  { value: 'business', label: 'Business Buffer' },
  { value: 'wedding', label: 'Marriage Fund' },
  { value: 'education', label: 'Education' },
  { value: 'car', label: 'Car Fund' },
  { value: 'default', label: 'Other' },
]

export function CreateVaultModal({ open, onCancel, onSubmit, loading }: CreateVaultModalProps) {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm<CreateVaultFormValues>()
  const theme = useTheme()

  const values = Form.useWatch([], form) as CreateVaultFormValues | undefined

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      const fields = step === 0 ? ['name'] : step === 1 ? ['unlock_date'] : []
      await form.validateFields(fields)
      setStep((s) => s + 1)
    } else {
      await form.validateFields()
      onSubmit({
        ...form.getFieldsValue(),
        unlock_date: form.getFieldValue('unlock_date'),
      })
      form.resetFields()
      setStep(0)
    }
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const handleClose = () => {
    form.resetFields()
    setStep(0)
    onCancel()
  }

  return (
    <Modal
      title="Create Money Vault"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Steps current={step} style={{ marginBottom: 24 }} size="small">
        {STEPS.map((s) => (
          <Steps.Step key={s.key} title={s.title} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          vault_type: 'soft',
          break_early_allowed: false,
          auto_unlock: true,
          unlock_date: dayjs().add(1, 'year'),
          vault_category: 'default',
        }}
      >
        {/* Step 0: keep in DOM but hidden when not active */}
        <div style={{ display: step === 0 ? 'block' : 'none' }}>
          <Form.Item name="name" label="Vault name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input placeholder="e.g. Emergency Fund, Vacation Fund" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={2} placeholder="What is this vault for?" />
          </Form.Item>
          <Form.Item name="vault_category" label="Category">
            <Select options={CATEGORIES} />
          </Form.Item>
          <Form.Item name="target_amount" label="Target amount (optional)">
            <InputNumber min={0} step={100} style={{ width: '100%' }} prefix="$" placeholder="Leave empty for open-ended" />
          </Form.Item>
        </div>

        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <Form.Item name="unlock_date" label="Unlock date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="vault_type" label="Vault mode">
            <Select
              options={[
                { value: 'soft', label: 'In-app lock — behavioral lock, funds tracked in app' },
                { value: 'real', label: 'Partner-backed — real safeguarded balance (when available)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="break_early_allowed" label="Allow early break" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(_, v) => v.break_early_allowed}>
            {({ getFieldValue }) =>
              getFieldValue('break_early_allowed') ? (
                <>
                  <Form.Item name="break_early_penalty_type" label="Penalty type">
                    <Select
                      options={[
                        { value: 'percentage', label: 'Percentage of amount' },
                        { value: 'fixed', label: 'Fixed amount' },
                        { value: 'none', label: 'No penalty' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="break_early_penalty_value" label="Penalty value">
                    <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="e.g. 5 for 5% or 50 for $50" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
          <Form.Item name="auto_unlock" label="Auto-unlock on date" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          <Form.Item name="initial_amount" label="Initial funding (optional)">
            <InputNumber min={0} step={50} style={{ width: '100%' }} prefix="$" placeholder="Add funds later if you prefer" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            You can fund this vault from your available balance after creation.
          </Text>
        </div>

        {step === 3 && values && (
          <div style={{ padding: 16, background: theme.hoverBg, borderRadius: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Name</Text>
              <div style={{ fontWeight: 600 }}>{values.name}</div>
            </div>
            {values.target_amount && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Target</Text>
                <div>${values.target_amount?.toLocaleString()}</div>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Unlock date</Text>
              <div>{values.unlock_date?.format('MMM D, YYYY')}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Mode</Text>
              <div>{values.vault_type === 'real' ? 'Partner-backed' : 'In-app lock'}</div>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Review vault rules before confirming. Your money will be allocated and tracked separately in this vault.
            </Text>
          </div>
        )}
      </Form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button onClick={step === 0 ? handleClose : handleBack}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button type="primary" onClick={handleNext} loading={loading}>
          {step === STEPS.length - 1 ? 'Create vault' : 'Next'}
        </Button>
      </div>
    </Modal>
  )
}
