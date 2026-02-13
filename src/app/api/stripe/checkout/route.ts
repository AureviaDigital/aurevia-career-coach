import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Get environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID_PRO;

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

    const base = (process.env.APP_BASE_URL ?? "").trim();

    if (!base) {
      return NextResponse.json(
        { error: "Missing APP_BASE_URL" },
        { status: 500 }
      );
    }

    // Validate and normalize the base URL
    let origin: string;
    try {
      const baseUrl = new URL(base);
      origin = baseUrl.origin;
    } catch {
      return NextResponse.json(
        { error: "Invalid APP_BASE_URL", base },
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

    // Build URLs from origin
    const success_url = new URL("/app?checkout=success", origin).toString();
    const cancel_url = new URL("/app?checkout=cancel", origin).toString();

    console.log("APP_BASE_URL_RAW", process.env.APP_BASE_URL);
    console.log("APP_BASE_URL_ORIGIN", origin);
    console.log("SUCCESS_URL", success_url);
    console.log("CANCEL_URL", cancel_url);

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
      success_url,
      cancel_url,
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
      { error: "Stripe checkout failed", message: String(err?.message || err) },
      { status: 500 }
    );
  }
}
