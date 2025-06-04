// backend/src/routes/stripe.routes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Important: Raw body parser for webhook
router.post('/webhook', 
  express.raw({type: 'application/json'}),
  stripeController.handleWebhook
);

router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Add session verification endpoint
router.get('/verify-session/:sessionId', stripeController.verifySession);

module.exports = router;