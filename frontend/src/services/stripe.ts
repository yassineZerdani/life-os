/**
 * Stripe API service — health, customers, setup intents.
 * Never use secret keys in frontend. Publishable key from env only.
 */
import { api } from './api'

export interface StripeHealthResponse {
  stripe_configured: boolean
  config_valid: boolean
  config_errors: string[]
  test_mode: boolean | null
  webhook_secret_present: boolean
}

export interface StripeCustomerResponse {
  customer_id: string
  already_exists?: boolean
}

export interface StripeSetupIntentResponse {
  client_secret: string
  intent_id: string
}

export interface StripeWebhookEvent {
  id: string
  event_id: string
  event_type: string
  processed: boolean
  created_at: string | null
}

export const stripeService = {
  getHealth: () => api.get<StripeHealthResponse>('/stripe/health'),
  createCustomer: () => api.post<StripeCustomerResponse>('/stripe/customers', {}),
  createSetupIntent: () => api.post<StripeSetupIntentResponse>('/stripe/setup-intent', {}),
  listWebhookEvents: (limit = 20) =>
    api.get<StripeWebhookEvent[]>(`/stripe/webhook-events?limit=${limit}`),
}

/** Publishable key from env — never log or expose secret keys */
export function getStripePublishableKey(): string | null {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  return (typeof key === 'string' && key.length > 0) ? key : null
}
