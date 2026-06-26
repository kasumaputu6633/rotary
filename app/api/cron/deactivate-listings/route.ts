import { NextResponse } from "next/server";
import { runDeactivateListingsCron } from "@/lib/listings-cron";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleDeactivateCron(request);
}

export async function POST(request: Request) {
  return handleDeactivateCron(request);
}

async function handleDeactivateCron(request: Request) {
  // 1. Verifikasi authorization header dengan CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runDeactivateListingsCron(true);
    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
