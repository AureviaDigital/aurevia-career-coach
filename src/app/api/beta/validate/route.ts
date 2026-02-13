import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const masterCode = process.env.BETA_MASTER_CODE;
    const codesEnv = process.env.BETA_INVITE_CODES;

    console.log("BETA_MASTER_CODE_PRESENT", Boolean(masterCode));
    console.log("BETA_INVITE_CODES_PRESENT", Boolean(codesEnv));

    if (!masterCode && (!codesEnv || !codesEnv.trim())) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: missing BETA_INVITE_CODES and BETA_MASTER_CODE" },
        { status: 500 }
      );
    }

    const normalizedInput = code.trim().toUpperCase();

    // Check master code
    if (masterCode && normalizedInput === masterCode.trim().toUpperCase()) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Check invite codes
    if (codesEnv) {
      const validCodes = codesEnv.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
      console.log("BETA_INVITE_CODES_COUNT", validCodes.length);

      if (validCodes.includes(normalizedInput)) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    }

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
