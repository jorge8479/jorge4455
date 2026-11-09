import { NextRequest, NextResponse } from "next/server";
import { requirePlayerAuth } from "@/lib/auth";
import { getPlayerCoins } from "@/lib/coins";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePlayerAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await getPlayerCoins(auth.accountName);
    if (!result || !result.success) {
      return NextResponse.json({ balance: 0 });
    }

    return NextResponse.json({ balance: result.balance || 0 });
  } catch {
    return NextResponse.json({ balance: 0 });
  }
}
