/**
 * useStripeSetup — create customer and setup intent for adding payment method.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stripeService } from '../services/stripe'

export function useStripeSetup() {
  const queryClient = useQueryClient()

  const createCustomer = useMutation({
    mutationFn: () => stripeService.createCustomer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe'] })
    },
  })

  const createSetupIntent = useMutation({
    mutationFn: () => stripeService.createSetupIntent(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe'] })
    },
  })

  return {
    createCustomer,
    createSetupIntent,
  }
}
