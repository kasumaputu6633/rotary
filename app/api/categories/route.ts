import { getActiveCategories } from "@/lib/categories";
import { NextResponse } from "next/server";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export const dynamic = "force-dynamic";

// GET /api/categories — kategori aktif untuk mega-menu navbar (lazy-fetch).
export async function GET() {
  const categories = await getActiveCategories();
  return NextResponse.json({ categories }, { headers: noStoreHeaders });
}
