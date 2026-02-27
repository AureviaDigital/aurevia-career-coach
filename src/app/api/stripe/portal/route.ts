import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCustomerId } from "@/lib/proStore";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
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

    let origin: string;
    try {
      const baseUrl = new URL(base);
      origin = baseUrl.origin;
    } catch {
      return NextResponse.json(
        { error: "Invalid APP_BASE_URL" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    const customerId = await getCustomerId(deviceId);
    if (!customerId) {
      return NextResponse.json(
        { error: "customer_not_found" },
        { status: 404 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const return_url = new URL("/app", origin).toString();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("STRIPE_PORTAL_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: "Stripe portal failed", message: String(err?.message || err) },
      { status: 500 }
    );
  }
}
