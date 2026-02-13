import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const codesEnv = process.env.BETA_INVITE_CODES;
    if (!codesEnv) {
      console.error("BETA_VALIDATE: BETA_INVITE_CODES not configured");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const validCodes = codesEnv.split(",").map((c) => c.trim().toUpperCase());
    const normalizedInput = code.trim().toUpperCase();

    if (validCodes.includes(normalizedInput)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
