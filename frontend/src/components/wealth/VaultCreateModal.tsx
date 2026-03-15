import { Modal, Form, Input, InputNumber, DatePicker, Switch, Select, Button } from 'antd'
import dayjs from 'dayjs'

export interface VaultCreateFormValues {
  name: string
  description?: string
  target_amount?: number
  unlock_date: dayjs.Dayjs
  vault_type: 'soft' | 'real'
  break_early_allowed: boolean
  break_early_penalty_type?: string
  break_early_penalty_value?: number
  auto_unlock: boolean
}

interface VaultCreateModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: VaultCreateFormValues) => void
  loading?: boolean
}

export function VaultCreateModal({ open, onCancel, onSubmit, loading }: VaultCreateModalProps) {
  const [form] = Form.useForm<VaultCreateFormValues>()

  return (
    <Modal
      title="Create Money Vault"
      open={open}
      onCancel={() => { form.resetFields(); onCancel() }}
      footer={null}
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          vault_type: 'soft',
          break_early_allowed: false,
          auto_unlock: true,
          unlock_date: dayjs().add(1, 'year'),
        }}
        onFinish={(v) => {
          onSubmit({
            ...v,
            unlock_date: v.unlock_date,
          })
          form.resetFields()
        }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Emergency Fund, Vacation Fund" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional" />
        </Form.Item>
        <Form.Item name="target_amount" label="Target amount (optional)">
          <InputNumber min={0} step={100} style={{ width: '100%' }} prefix="$" placeholder="Leave empty for open-ended" />
        </Form.Item>
        <Form.Item name="unlock_date" label="Unlock date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="vault_type" label="Vault type">
          <Select
            options={[
              { value: 'soft', label: 'Soft (in-app behavioral lock)' },
              { value: 'real', label: 'Real (partner-backed, when available)' },
            ]}
          />
        </Form.Item>
        <Form.Item name="break_early_allowed" label="Allow early break" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(p, c) => p.break_early_allowed !== c.break_early_allowed}>
          {({ getFieldValue }) =>
            getFieldValue('break_early_allowed') ? (
              <>
                <Form.Item name="break_early_penalty_type" label="Penalty type">
                  <Select
                    options={[
                      { value: 'percentage', label: 'Percentage' },
                      { value: 'fixed', label: 'Fixed amount' },
                      { value: 'none', label: 'None' },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="break_early_penalty_value" label="Penalty value">
                  <InputNumber min={0} step={1} style={{ width: '100%' }} placeholder="e.g. 5 for 5% or $50" />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>
        <Form.Item name="auto_unlock" label="Auto-unlock on date" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => { form.resetFields(); onCancel() }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading ? 'Creating...' : 'Create Vault'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
