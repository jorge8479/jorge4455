import { NextRequest, NextResponse } from "next/server";
import { requirePlayerAuth } from "@/lib/auth";
import { getCoinTransactions } from "@/lib/coins";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePlayerAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allTx = await getCoinTransactions();
    const playerTx = allTx.filter(t => t.account === auth.accountName);
    return NextResponse.json({ transactions: playerTx.slice(0, 50) });
  } catch {
    return NextResponse.json({ transactions: [] });
  }
}
