import { NextRequest, NextResponse } from "next/server";
import { getProStatus } from "@/lib/proStore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId query parameter is required" },
        { status: 400 }
      );
    }

    // Get Pro status from store
    const isPro = await getProStatus(deviceId);

    console.log(`Pro status check for device ${deviceId}: ${isPro}`);

    return NextResponse.json({
      isPro,
    });
  } catch (err: any) {
    console.error("PRO_STATUS_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
