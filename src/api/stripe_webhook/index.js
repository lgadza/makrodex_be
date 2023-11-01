// File: routes/stripeWebhooks.js
import express from 'express';
import { Stripe } from 'stripe';
import { sequelize } from './models/UserSubscription'; // Import the UserSubscription model here

const stripeRouter = express.Router();
const stripe = new Stripe('your_stripe_secret_key', {
  apiVersion: '2020-08-27', // Your Stripe API version
});

stripeRouter.post('/webhooks', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'your_stripe_webhook_secret';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    if (!session.metadata.userId) {
      return res.status(400).send('User id is required');
    }

    try {
      await sequelize.transaction(async (t) => {
        await sequelize.models.UserSubscription.create({
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }, { transaction: t });
      });
    } catch (err) {
      return res.status(500).send('Error saving data to database');
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const session = event.data.object;
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    try {
      await sequelize.transaction(async (t) => {
        await sequelize.models.UserSubscription.update({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }, {
          where: { stripeSubscriptionId: subscription.id },
          transaction: t,
        });
      });
    } catch (err) {
      return res.status(500).send('Error updating data in database');
    }
  }

  return res.status(200).end();
});

export default stripeRouter;
