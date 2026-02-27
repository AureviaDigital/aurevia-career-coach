import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const r = getRedis();
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
