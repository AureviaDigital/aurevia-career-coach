import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const codesEnv = process.env.BETA_INVITE_CODES;

    console.log("BETA_INVITE_CODES_PRESENT", Boolean(codesEnv));

    if (!codesEnv || !codesEnv.trim()) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: missing BETA_INVITE_CODES" },
        { status: 500 }
      );
    }

    const validCodes = codesEnv.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);

    console.log("BETA_INVITE_CODES_COUNT", validCodes.length);

    const normalizedInput = code.trim().toUpperCase();

    if (validCodes.includes(normalizedInput)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
