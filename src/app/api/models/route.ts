import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/models";
const ANTHROPIC_VERSION = "2023-06-01";

export async function GET(request: NextRequest) {
  try {
    // Check if API key is present
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY. Check .env.local and restart server." },
        { status: 500 }
      );
    }

    console.log("Fetching available Anthropic models...");

    // Call Anthropic API to list models
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Anthropic API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Successfully fetched models:", data);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("ERROR fetching models:", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
