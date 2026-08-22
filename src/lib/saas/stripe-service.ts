// src/lib/saas/stripe-service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export class StripeService {
  static async createCheckoutSession(params: {
    organizationId: string;
    planId: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    successUrl: string;
    cancelUrl: string;
  }) {
    const { prisma } = require('@/lib/prisma');
    
    const organization = await prisma.organization.findUnique({
      where: { id: params.organizationId },
      include: { plan: true },
    });
    
    const plan = await prisma.plan.findUnique({
      where: { id: params.planId },
    });
    
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    const priceId = params.billingCycle === 'MONTHLY' 
      ? plan.stripePriceId 
      : plan.stripeYearlyPriceId;
    
    if (!priceId) {
      throw new Error('Price ID not configured for this plan');
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: organization?.stripeCustomerId || undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        organizationId: params.organizationId,
        planId: params.planId,
      },
    });
    
    return session;
  }
  
  static async createCustomer(params: {
    email: string;
    name: string;
  }) {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
    });
    
    return customer;
  }
  
  static async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  }
  
  static async getSubscription(stripeSubscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return subscription;
  }
}
