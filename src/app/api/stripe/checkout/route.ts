import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Get environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID_PRO;
    const appBaseUrl = process.env.APP_BASE_URL;

    // Validate environment variables
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID_PRO" },
        { status: 500 }
      );
    }

    if (!appBaseUrl) {
      return NextResponse.json(
        { error: "Missing APP_BASE_URL" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    console.log(`Creating checkout session for device: ${deviceId}`);

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appBaseUrl}/app?checkout=success`,
      cancel_url: `${appBaseUrl}/app?checkout=cancel`,
      metadata: {
        deviceId,
      },
      subscription_data: {
        metadata: {
          deviceId,
        },
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    // Return the checkout URL
    return NextResponse.json({
      url: session.url,
    });
  } catch (err: any) {
    console.error("STRIPE_CHECKOUT_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
