import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

export async function GET(request: NextRequest) {
  try {
    const r = getRedis();
    const key = request.nextUrl.searchParams.get("key");

    if (key) {
      const val = await r.get(key);
      return NextResponse.json({ ok: true, key, val });
    }

    await r.set("debug:ping", "1");
    const val = await r.get("debug:ping");
    return NextResponse.json({ ok: true, val });
  } catch (err: any) {
    console.error("DEBUG_REDIS_ERROR", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
