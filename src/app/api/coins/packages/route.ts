import { NextRequest, NextResponse } from "next/server";
import { getCoinPackages } from "@/lib/coins";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const packages = await getCoinPackages();
    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ packages: [] });
  }
}
