import { Form, InputNumber, Button } from 'antd'

interface VaultFundingFormProps {
  onFund: (amount: number) => void
  loading?: boolean
  maxAmount?: number
}

export function VaultFundingForm({ onFund, loading, maxAmount }: VaultFundingFormProps) {
  const [form] = Form.useForm<{ amount: number }>()

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={(v) => {
        onFund(v.amount)
        form.resetFields()
      }}
    >
      <Form.Item name="amount" rules={[{ required: true, message: 'Enter amount' }]}>
        <InputNumber
          min={0.01}
          max={maxAmount}
          step={10}
          prefix="$"
          placeholder="Amount"
          style={{ width: 140 }}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Fund
        </Button>
      </Form.Item>
    </Form>
  )
}
