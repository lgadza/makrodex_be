import stripePackage from "stripe";
import express from "express";
const stripeRouter = express.Router();
const stripe_key = process.env.STRIPE_PRIVATE_KEY;

const stripe = stripePackage(stripe_key);

const storeItems = new Map([
  [1, { priceInCents: 199, name: "individual what'sApp makronexa plan" }],
  [2, { priceInCents: 999, name: "individual web makronexa plan" }],
]);

stripeRouter.post("/", async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents, 
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.FE_PROD_URL}/check-out/success`,
      cancel_url: `${process.env.FE_PROD_URL}/check-out/cancel`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default stripeRouter;
