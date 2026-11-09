import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getCoinPackages, DEFAULT_COIN_PACKAGES } from "@/lib/coins";
import { uploadFile } from "@/lib/mtasa";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const packages = await getCoinPackages();
    return NextResponse.json({ packages });
  } catch {
    return NextResponse.json({ packages: DEFAULT_COIN_PACKAGES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { packages } = await req.json();
    if (!packages || !Array.isArray(packages)) {
      return NextResponse.json({ error: "Invalid packages data" }, { status: 400 });
    }

    const json = JSON.stringify({ packages, updatedBy: auth.accountName, timestamp: Math.floor(Date.now() / 1000) });
    const encoder = new TextEncoder();
    await uploadFile("/mods/deathmatch/resources/webadmin/coin_packages.json", encoder.encode(json));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
