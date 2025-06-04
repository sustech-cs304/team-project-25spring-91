// backend/src/services/stripe.service.js
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

class StripeService {
  async constructEvent(payload, signature) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  async handleStripeEvent(event) {
    console.log(`Handling event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

async handleCheckoutSessionCompleted(session) {
  try {
    console.log('=== CHECKOUT SESSION COMPLETED ===');
    console.log('Session ID:', session.id);
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    const customerEmail = session.customer_details?.email || session.metadata?.userEmail;
    const planId = parseInt(session.metadata?.planId);
    const gymId = parseInt(session.metadata?.gymId);
    
    console.log('Extracted data:', { customerEmail, planId, gymId });
    
    if (!customerEmail || !planId || !gymId) {
      console.error('Missing required data in session metadata');
      console.error('Available metadata:', session.metadata);
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      console.error(`User not found with email: ${customerEmail}`);
      return;
    }

    console.log('Found user:', user.id);

    // Get membership plan details
    const membershipPlan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!membershipPlan) {
      console.error(`Membership plan not found with ID: ${planId}`);
      return;
    }

    console.log('Found membership plan:', membershipPlan.name);

    // Calculate membership dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + membershipPlan.durationDays);

    console.log('Membership dates:', { startDate, endDate });

    // Check for existing active membership
    const existingMembership = await prisma.userMembership.findFirst({
      where: {
        userId: user.id,
        gymId: gymId,
        status: { in: ['active'] }
      }
    });

    console.log('Existing membership:', existingMembership?.id || 'none');

    let userMembership;

    if (existingMembership) {
      // Update existing membership
      userMembership = await prisma.userMembership.update({
        where: { id: existingMembership.id },
        data: {
          planId: planId,
          startDate: startDate,
          endDate: endDate,
          status: 'active',
          autoRenew: false, // Set to false for one-time payments
        }
      });
      console.log('Updated existing membership:', userMembership.id);
    } else {
      // Create new membership
      userMembership = await prisma.userMembership.create({
        data: {
          userId: user.id,
          gymId: gymId,
          planId: planId,
          startDate: startDate,
          endDate: endDate,
          status: 'active',
          autoRenew: false, // Set to false for one-time payments
        }
      });
      console.log('Created new membership:', userMembership.id);
    }

    // Create payment record
    const payment = await prisma.membershipPayment.create({
      data: {
        membershipId: userMembership.id,
        amount: membershipPlan.price,
        paymentDate: new Date(),
        paymentMethod: 'stripe',
        transactionId: session.payment_intent || session.id,
        status: 'completed',
      }
    });

    console.log('Created payment record:', payment.id);
    console.log('=== MEMBERSHIP CREATION COMPLETED ===');

  } catch (error) {
    console.error('=== ERROR IN CHECKOUT SESSION COMPLETED ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
  }
}

  async handleSubscriptionCreated(subscription) {
    try {
      console.log('Subscription created:', subscription.id);
      
      // Update user with subscription info
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer },
        data: {
          stripeSubscriptionId: subscription.id,
        }
      });
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  async handleSubscriptionUpdated(subscription) {
    try {
      console.log('Subscription updated:', subscription.id);
      
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer }
      });

      if (!user) {
        console.error(`User not found with Stripe customer ID: ${subscription.customer}`);
        return;
      }

      // Update membership status based on subscription status
      let membershipStatus = 'active';
      if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        membershipStatus = 'cancelled';
      } else if (subscription.status === 'past_due') {
        membershipStatus = 'expired';
      }

      // Update active memberships
      await prisma.userMembership.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: membershipStatus,
          autoRenew: subscription.status === 'active'
        }
      });

      console.log(`Membership status updated for user: ${user.id}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  async handleSubscriptionDeleted(subscription) {
    try {
      console.log('Subscription deleted:', subscription.id);
      
      // Find user by Stripe customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer }
      });

      if (!user) {
        console.error(`User not found with Stripe customer ID: ${subscription.customer}`);
        return;
      }

      // Cancel active memberships
      await prisma.userMembership.updateMany({
        where: {
          userId: user.id,
          status: 'active'
        },
        data: {
          status: 'cancelled',
          autoRenew: false
        }
      });

      // Clear subscription info from user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: null
        }
      });

      console.log(`Subscription cancelled for user: ${user.id}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  async handleInvoicePaymentSucceeded(invoice) {
    try {
      console.log('Invoice payment succeeded:', invoice.id);
      
      // Find user by customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: invoice.customer }
      });

      if (!user) {
        console.error(`User not found with Stripe customer ID: ${invoice.customer}`);
        return;
      }

      // Find active membership
      const membership = await prisma.userMembership.findFirst({
        where: {
          userId: user.id,
          status: { in: ['active', 'expired'] }
        },
        include: {
          membershipPlan: true
        }
      });

      if (membership && membership.membershipPlan) {
        // Extend membership if it's a renewal
        const newEndDate = new Date(membership.endDate);
        newEndDate.setDate(newEndDate.getDate() + membership.membershipPlan.durationDays);

        await prisma.userMembership.update({
          where: { id: membership.id },
          data: {
            endDate: newEndDate,
            status: 'active'
          }
        });

        // Create payment record
        await prisma.membershipPayment.create({
          data: {
            membershipId: membership.id,
            amount: membership.membershipPlan.price,
            paymentDate: new Date(),
            paymentMethod: 'stripe',
            transactionId: invoice.payment_intent || invoice.id,
            status: 'completed',
          }
        });

        console.log(`Membership renewed for user: ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
    }
  }

  async handleInvoicePaymentFailed(invoice) {
    try {
      console.log('Invoice payment failed:', invoice.id);
      
      // Find user by customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: invoice.customer }
      });

      if (!user) {
        console.error(`User not found with Stripe customer ID: ${invoice.customer}`);
        return;
      }

      // Find active membership and create failed payment record
      const membership = await prisma.userMembership.findFirst({
        where: {
          userId: user.id,
          status: 'active'
        },
        include: {
          membershipPlan: true
        }
      });

      if (membership && membership.membershipPlan) {
        await prisma.membershipPayment.create({
          data: {
            membershipId: membership.id,
            amount: membership.membershipPlan.price,
            paymentDate: new Date(),
            paymentMethod: 'stripe',
            transactionId: invoice.payment_intent || invoice.id,
            status: 'failed',
          }
        });

        console.log(`Failed payment recorded for user: ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling invoice payment failed:', error);
    }
  }


async createCheckoutSession(data) {
  const { planId, gymId, userEmail, successUrl, cancelUrl } = data;
  
  console.log('Creating checkout session with data:', data);
  
  // Get plan details to set the correct price
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: parseInt(planId) }
  });

  if (!plan) {
    throw new Error('Membership plan not found');
  }

  console.log('Found plan:', plan);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // Change to 'payment' for one-time payment instead of subscription
    customer_email: userEmail,
    line_items: [{
      price_data: { 
        currency: 'usd',
        product_data: {
          name: plan.name,
          description: plan.description,
        },
        unit_amount: Math.round(plan.price * 100), // Convert to cents
      },
      quantity: 1,
    }],
    metadata: {
      planId: planId.toString(),
      gymId: gymId.toString(),
      userEmail: userEmail, // Add email to metadata too
    },
    success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/canceled`,
  });

  console.log('Created session:', session.id);
  return session;
}
}

module.exports = new StripeService();