import { loadStripe, Stripe } from '@stripe/stripe-js';
import { SubscriptionPlan } from '../types';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

class StripeService {
  private stripe: Promise<Stripe | null>;
  private stripeInstance: Stripe | null = null;

  constructor() {
    this.stripe = loadStripe(STRIPE_PUBLISHABLE_KEY);
    this.initializeStripe();
  }

  private async initializeStripe() {
    this.stripeInstance = await this.stripe;
    if (!this.stripeInstance) {
      console.warn('Stripe failed to initialize. Payment features will be disabled.');
    }
  }

  // Subscription plans configuration
  private subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Basic meal discovery',
        'Location-based search',
        'Basic dietary filtering',
        'Up to 5 saved locations'
      ],
      stripePriceId: ''
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5,
      interval: 'month',
      features: [
        'All Free features',
        'AI-powered meal recommendations',
        'Advanced meal planning',
        'Unlimited saved locations',
        'Priority customer support',
        'Exclusive restaurant deals',
        'Offline access',
        'Nutrition tracking',
        'Custom dietary profiles'
      ],
      stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly'
    }
  ];

  // Get available subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.subscriptionPlans;
  }

  // Get specific subscription plan
  getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return this.subscriptionPlans.find(plan => plan.id === planId) || null;
  }

  // Create checkout session for subscription
  async createCheckoutSession(
    planId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string } | null> {
    try {
      const plan = this.getSubscriptionPlan(planId);
      if (!plan || plan.price === 0) {
        throw new Error('Invalid subscription plan');
      }

      // In a real application, this would be a server-side API call
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          successUrl,
          cancelUrl,
          mode: 'subscription'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string): Promise<boolean> {
    if (!this.stripeInstance) {
      console.error('Stripe not initialized');
      return false;
    }

    try {
      const { error } = await this.stripeInstance.redirectToCheckout({
        sessionId
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      return false;
    }
  }

  // Create subscription directly (for testing or simple flows)
  async createSubscription(
    planId: string,
    userId: string,
    paymentMethodId: string
  ): Promise<{ subscriptionId: string; clientSecret: string } | null> {
    try {
      const plan = this.getSubscriptionPlan(planId);
      if (!plan || plan.price === 0) {
        throw new Error('Invalid subscription plan');
      }

      // This would typically be a server-side API call
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          paymentMethodId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const subscription = await response.json();
      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  // Update subscription
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }

  // Get subscription status
  async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    planId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null> {
    try {
      const response = await fetch(`/api/subscription-status/${userId}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  // Create payment intent for one-time payments (tips, etc.)
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentIntent = await response.json();
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  // Confirm payment
  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripeInstance) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const { error, paymentIntent } = await this.stripeInstance.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethodId
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: paymentIntent?.status === 'succeeded' };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(userId: string): Promise<{ clientSecret: string } | null> {
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const setupIntent = await response.json();
      return { clientSecret: setupIntent.client_secret };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return null;
    }
  }

  // Get saved payment methods
  async getPaymentMethods(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/payment-methods/${userId}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.payment_methods || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  // Format price for display
  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  // Check if user has premium features
  isPremiumUser(subscriptionStatus: any): boolean {
    return subscriptionStatus?.isActive && subscriptionStatus?.planId === 'premium';
  }

  // Get feature availability based on subscription
  getFeatureAvailability(subscriptionStatus: any): {
    aiRecommendations: boolean;
    mealPlanning: boolean;
    unlimitedSavedLocations: boolean;
    prioritySupport: boolean;
    exclusiveDeals: boolean;
    offlineAccess: boolean;
    nutritionTracking: boolean;
  } {
    const isPremium = this.isPremiumUser(subscriptionStatus);
    
    return {
      aiRecommendations: isPremium,
      mealPlanning: isPremium,
      unlimitedSavedLocations: isPremium,
      prioritySupport: isPremium,
      exclusiveDeals: isPremium,
      offlineAccess: isPremium,
      nutritionTracking: isPremium,
    };
  }
}

export const stripeService = new StripeService();
export default stripeService;
