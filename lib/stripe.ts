import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2025-11-17.clover' as any,
  typescript: true,
});
