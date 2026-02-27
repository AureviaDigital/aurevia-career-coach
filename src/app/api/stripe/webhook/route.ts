import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { activatePro, deactivatePro, setCustomerId } from "@/lib/proStore";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("WEBHOOK_ERROR: No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("WEBHOOK_ERROR: STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature and construct the event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("WEBHOOK_ERROR: Invalid signature", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("WEBHOOK_RECEIVED", event.type);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const deviceId = session.metadata?.deviceId;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

        if (deviceId) {
          console.log("PRO_UNLOCKED", deviceId, "(checkout.session.completed)");
          await activatePro(deviceId);
          if (customerId) {
            await setCustomerId(deviceId, customerId);
          }
        } else {
          console.warn("WEBHOOK_WARNING: No deviceId in session metadata");
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const deviceId = subscription.metadata?.deviceId;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

        if (deviceId) {
          console.log("PRO_UNLOCKED", deviceId, "(customer.subscription.created)");
          await activatePro(deviceId);
          if (customerId) {
            await setCustomerId(deviceId, customerId);
          }
        } else {
          console.warn("WEBHOOK_WARNING: No deviceId in subscription metadata");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const deviceId = subscription.metadata?.deviceId;

        if (deviceId) {
          // Check if subscription is active or canceled
          if (subscription.status === "active") {
            console.log("PRO_UNLOCKED", deviceId, "(customer.subscription.updated - active)");
            await activatePro(deviceId);
          } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
            console.log("PRO_LOCKED", deviceId, "(customer.subscription.updated - inactive)");
            await deactivatePro(deviceId);
          }
        } else {
          console.warn("WEBHOOK_WARNING: No deviceId in subscription metadata");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const deviceId = subscription.metadata?.deviceId;

        if (deviceId) {
          console.log("PRO_LOCKED", deviceId, "(customer.subscription.deleted)");
          await deactivatePro(deviceId);
        } else {
          console.warn("WEBHOOK_WARNING: No deviceId in subscription metadata");
        }
        break;
      }

      default:
        console.log(`WEBHOOK_UNHANDLED: ${event.type}`);
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("WEBHOOK_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
