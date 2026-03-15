/**
 * Stripe connection settings — Wealth domain.
 * Connection status, test mode, funding methods, webhook activity.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Typography, Button, Tag, Alert, Space } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined, PlusOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'
import { stripeService } from '../../../services/stripe'
import { useStripeSetup } from '../../../hooks/useStripeSetup'

const { Title, Text } = Typography

export function StripeConnectionPage() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const { createCustomer, createSetupIntent } = useStripeSetup()

  const { data: health, isLoading } = useQuery({
    queryKey: ['stripe', 'health'],
    queryFn: () => stripeService.getHealth(),
  })

  const { data: webhookEvents = [] } = useQuery({
    queryKey: ['stripe', 'webhook-events'],
    queryFn: () => stripeService.listWebhookEvents(10),
    enabled: !!health?.stripe_configured,
  })

  if (isLoading) {
    return <Text>Loading Stripe status...</Text>
  }

  const configured = health?.stripe_configured ?? false
  const testMode = health?.test_mode ?? false
  const webhookOk = health?.webhook_secret_present ?? false

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: theme.textPrimary }}>
          Stripe Connection
        </Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Payment infrastructure for funding your wealth account and Money Vaults.
        </Text>
      </div>

      {/* Connection status */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {configured ? (
            <CheckCircleOutlined style={{ fontSize: 24, color: '#22c55e' }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />
          )}
          <div>
            <Text strong style={{ fontSize: 16 }}>
              {configured ? 'Stripe configured' : 'Stripe not configured'}
            </Text>
            {configured && (
              <div style={{ marginTop: 4 }}>
                <Tag color={testMode ? 'orange' : 'green'}>
                  {testMode ? 'Test mode' : 'Live mode'}
                </Tag>
              </div>
            )}
          </div>
        </div>
        {!configured && (
          <Alert
            type="info"
            message="Configure Stripe"
            description="Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in the backend .env. Use test keys (sk_test_, pk_test_) for development."
            style={{ marginTop: 8 }}
          />
        )}
        {health?.config_errors && health.config_errors.length > 0 && (
          <Alert
            type="warning"
            message="Configuration issues"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {health.config_errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            }
            style={{ marginTop: 8 }}
          />
        )}
      </Card>

      {/* Webhook status */}
      {configured && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: `1px solid ${theme.contentCardBorder}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <SafetyOutlined style={{ color: theme.accent }} />
            <Text strong>Webhook</Text>
          </div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Webhook signature verification {webhookOk ? 'enabled' : 'not configured'}.
          </Text>
          {!webhookOk && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Set STRIPE_WEBHOOK_SECRET in backend .env for production.
            </Text>
          )}
        </Card>
      )}

      {/* Funding methods */}
      {configured && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: `1px solid ${theme.contentCardBorder}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>Funding methods</Text>
            <Space>
              <Button
                size="small"
                onClick={() => createCustomer.mutate()}
                loading={createCustomer.isPending}
              >
                Create customer
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => createSetupIntent.mutate()}
                loading={createSetupIntent.isPending}
              >
                Add payment method
              </Button>
            </Space>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Add a payment method to fund your wealth account. (Stripe Elements UI coming in Phase 2.)
          </Text>
        </Card>
      )}

      {/* Webhook activity */}
      {configured && webhookEvents.length > 0 && (
        <Card
          title="Recent webhook activity"
          style={{
            borderRadius: 12,
            border: `1px solid ${theme.contentCardBorder}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {webhookEvents.map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: 12,
                  background: theme.hoverBg,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text strong style={{ fontSize: 13 }}>{ev.event_type}</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    {ev.event_id}
                  </Text>
                </div>
                <Tag color={ev.processed ? 'green' : 'default'}>
                  {ev.processed ? 'Processed' : 'Pending'}
                </Tag>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Error states */}
      {createCustomer.isError && (
        <Alert
          type="error"
          message="Failed to create customer"
          description={String(createCustomer.error)}
          style={{ marginTop: 16 }}
        />
      )}
      {createSetupIntent.isError && (
        <Alert
          type="error"
          message="Failed to create setup intent"
          description={String(createSetupIntent.error)}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  )
}
