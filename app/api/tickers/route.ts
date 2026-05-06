import { NextResponse } from "next/server";
import { SYMBOLS, fetchAllTickers } from "@/lib/bybit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchAllTickers();
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("Tickers fetch error:", err);
    return NextResponse.json(
      { success: false, error: err.message, data: [] },
      { status: 500 }
    );
  }
}