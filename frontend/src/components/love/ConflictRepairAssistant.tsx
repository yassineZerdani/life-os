/**
 * Conflict repair assistant — guide through reflection, accountability, empathy, repair, reconnection.
 * Calm, non-blaming language.
 */
import { Card, Typography, Button, Steps, Form, Input } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { ConflictEntry } from '../../services/love'

const { Text } = Typography

const REPAIR_STEPS = [
  { key: 'reflecting', title: 'Reflection', description: 'What happened and what you each felt' },
  { key: 'accountability', title: 'Accountability', description: 'Your part in it' },
  { key: 'empathy', title: 'Empathy', description: 'Understanding their perspective' },
  { key: 'repair', title: 'Repair', description: 'Concrete step to repair' },
  { key: 'reconnected', title: 'Reconnected', description: 'Closure and reconnection' },
]

export interface ConflictRepairAssistantProps {
  conflict: ConflictEntry
  onUpdate: (id: string, data: Partial<ConflictEntry>) => void
  onComplete?: () => void
}

export function ConflictRepairAssistant({ conflict, onUpdate, onComplete }: ConflictRepairAssistantProps) {
  const theme = useTheme()
  const [form] = Form.useForm()
  const currentIndex = REPAIR_STEPS.findIndex((s) => s.key === conflict.status)
  const stepIndex = currentIndex >= 0 ? currentIndex : 0

  const handleStepUpdate = (field: keyof ConflictEntry, value: string) => {
    onUpdate(conflict.id, { [field]: value })
  }

  const advanceStatus = (next: string) => {
    onUpdate(conflict.id, { status: next })
    if (next === 'reconnected') onComplete?.()
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(conflict.date).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        {conflict.trigger && (
          <div style={{ marginTop: 4 }}>
            <Text strong>Trigger: </Text>
            <Text>{conflict.trigger}</Text>
          </div>
        )}
      </div>

      <Steps
        current={stepIndex}
        size="small"
        style={{ marginBottom: 24 }}
        items={REPAIR_STEPS.map((s, i) => ({
          title: s.title,
          description: i === stepIndex ? s.description : undefined,
        }))}
      />

      <Form layout="vertical" form={form} initialValues={{
        what_i_felt: conflict.what_i_felt ?? '',
        what_they_may_have_felt: conflict.what_they_may_have_felt ?? '',
        what_happened: conflict.what_happened ?? '',
        repair_needed: conflict.repair_needed ?? '',
      }}>
        {conflict.status === 'reflecting' && (
          <>
            <Form.Item name="what_happened" label="What happened (briefly)">
              <Input.TextArea
                rows={2}
                placeholder="Neutral description of what occurred"
                onBlur={(e) => handleStepUpdate('what_happened', e.target.value)}
              />
            </Form.Item>
            <Form.Item name="what_i_felt" label="What I felt">
              <Input.TextArea
                rows={2}
                placeholder="Your feelings without blame"
                onBlur={(e) => handleStepUpdate('what_i_felt', e.target.value)}
              />
            </Form.Item>
            <Form.Item name="what_they_may_have_felt" label="What they may have felt">
              <Input.TextArea
                rows={2}
                placeholder="Your best guess at their experience"
                onBlur={(e) => handleStepUpdate('what_they_may_have_felt', e.target.value)}
              />
            </Form.Item>
            <Button type="primary" onClick={() => advanceStatus('accountability')} style={{ borderRadius: 10 }}>
              Continue to accountability
            </Button>
          </>
        )}
        {conflict.status === 'accountability' && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Acknowledge your part without over-explaining. Then move to empathy.
            </Text>
            <Button type="primary" onClick={() => advanceStatus('empathy')} style={{ borderRadius: 10 }}>
              Continue to empathy
            </Button>
          </>
        )}
        {conflict.status === 'empathy' && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Sit with their perspective. When you’re ready, move to repair.
            </Text>
            <Button type="primary" onClick={() => advanceStatus('repair')} style={{ borderRadius: 10 }}>
              Continue to repair
            </Button>
          </>
        )}
        {conflict.status === 'repair' && (
          <>
            <Form.Item name="repair_needed" label="Repair step">
              <Input.TextArea
                rows={3}
                placeholder="One concrete action or conversation to repair"
                onBlur={(e) => handleStepUpdate('repair_needed', e.target.value)}
              />
            </Form.Item>
            <Button type="primary" onClick={() => advanceStatus('reconnected')} style={{ borderRadius: 10 }}>
              Mark reconnected
            </Button>
          </>
        )}
        {conflict.status === 'reconnected' && (
          <div style={{ padding: '12px 0' }}>
            <Text style={{ color: DOMAIN_COLORS.love, fontWeight: 500 }}>Repair flow complete.</Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              You can revisit this entry anytime or add a reconnection action from the dashboard.
            </Text>
          </div>
        )}
      </Form>
    </Card>
  )
}
