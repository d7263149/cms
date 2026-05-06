import { NextResponse } from "next/server";
import { fetchAllTickers } from "@/lib/bybit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllTickers();
    return NextResponse.json({ success: true, data, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
