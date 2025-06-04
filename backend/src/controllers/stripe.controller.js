// backend/src/controllers/stripe.controller.js
const stripeService = require('../services/stripe.service');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = await stripeService.constructEvent(req.body, sig);
    await stripeService.handleStripeEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripeService.createCheckoutSession(req.body);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add this new endpoint
const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
    });
  } catch (err) {
    console.error('Session Verification Error:', err);
    res.status(500).json({ error: err.message });
  }
};

const testMembershipCreation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Manually trigger the webhook handler
    await stripeService.handleCheckoutSessionCompleted(session);
    
    res.json({ success: true, message: 'Membership creation triggered manually' });
  } catch (error) {
    console.error('Manual test error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  handleWebhook,
  createCheckoutSession,
  verifySession,
  testMembershipCreation, // Add this
};